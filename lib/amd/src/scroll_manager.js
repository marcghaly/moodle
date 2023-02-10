// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Scroll manager is a class that help with saving the scroll positing when you
 * click on an action icon, and then when the page is reloaded after processing
 * the action, it scrolls you to exactly where you were. This is much nicer for
 * the user.
 *
 * To use this in your code, you need to ensure that:
 * 1. The button that triggers the action has to have a click event handler that
 *    calls saveScrollPos()
 * 2. After doing the processing, the redirect() function will add 'mdlscrollto'
 *    parameter into the redirect url automatically.
 * 3. Finally, on the page that is reloaded (which should be the same as the one
 *    the user started on) you need to call scrollToSavedPosition()
 *    on page load.
 *
 * @module     core/scroll_manager
 * @copyright  2021 The Open University
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {exception as displayException} from 'core/notification';

/** @property {HTMLElement} scrollingElement the current scrolling element. */
let scrollingElement = null;

/**
 * Find scroll position for a given subject id (a data set id) by searching one or two list of elements.
 *
 * @param {String} scrollSubjectId Subject we want to scroll to (represented by a dataset id)
 * @param {String} fallbackScrollSubjectId In case no subject found for scrollSubjectId, we can search another list of elements
 * @param {String} className Class name attribute present on several elements.
 * @param {String} fallbackClassName Class name to look for if first one returns nothing.
 *
 * @returns {String} y position for given subject id.
 */
const findScrollPosition = (scrollSubjectId, fallbackScrollSubjectId, className, fallbackClassName) => {
    const collection = document.getElementsByClassName(className);
    const matching = new Array();
    collection.forEach((element) => {
        if (element.dataset.id == scrollSubjectId) {
            matching.push(element.getBoundingClientRect().y);
        }
    });

    // If first class name returns no match, tries to find fallback.
    if (matching.length === 0 && fallbackClassName !== undefined) {
        const fallbackCollection = document.getElementsByClassName(fallbackClassName);
        fallbackCollection.forEach((element) => {
            // Only add element to array if visible.
            if (element.dataset.id == fallbackScrollSubjectId) {
                matching.push(element.getBoundingClientRect().y);
            }
        });
    }
    return matching[0];
};

/**
 * Gets scrolled subject / course index highlight.
 *
 * @param {String} scrollSubjectId Edit switch element
 * @param {String} selector Selector element to be passed to query selection, in addition to exisiting subject id as a dataid.
 */
const getIndexHighlight = async(scrollSubjectId, selector) => {
    const selection = selector + '[data-id="' + scrollSubjectId + '"]';
    while (document.querySelector(selection) === null) {
        await new Promise(resolve => requestAnimationFrame(resolve));
    }
    return document.querySelector(selection);
};

/**
 * Get the scrolling element.
 *
 * @returns {HTMLElement}
 */
const getScrollingElement = () => {
    if (scrollingElement === null) {
        const page = document.getElementById('page');
        if (isScrollable(page)) {
            scrollingElement = page;
        } else {
            scrollingElement = document.scrollingElement;
        }
    }

    return scrollingElement;
};

/**
 * Get the scroll position for this form.
 *
 * @param {HTMLFormElement} form
 * @returns {HTMLInputElement}
 */
const getScrollPositionElement = (form) => {
    const element = form.querySelector('input[name=mdlscrollto]');
    if (element) {
        return element;
    }

    const scrollPos = document.createElement('input');
    scrollPos.type = 'hidden';
    scrollPos.name = 'mdlscrollto';
    form.appendChild(scrollPos);

    return scrollPos;
};

/**
 * Is the element scrollable?
 *
 * @param {HTMLElement} element Element.
 * @returns {boolean}
 */
const isScrollable = (element) => {
    // Check if the element has scrollable content.
    const hasScrollableContent = element.scrollHeight > element.clientHeight;

    // If 'overflow-y' is set to hidden, the scroll bar is't show.
    const elementOverflow = window.getComputedStyle(element).overflowY;
    const isOverflowHidden = elementOverflow.indexOf('hidden') !== -1;

    return hasScrollableContent && !isOverflowHidden;
};

/**
 * Sets scrolled subject / course index highlight.
 *
 * @param {Element} element element to add hightlight to.
 */
const setIndexHighlight = (element) => {
    element.classList.add('pageitem');
    element.scrollIntoView(true);
};

/**
 * Get current scroll position.
 *
 * @returns {Number} Scroll position.
 */
export const getScrollPos = () => {
    const scrollingElement = getScrollingElement();

    return scrollingElement.scrollTop;
};

/**
 * Init event handlers for all links with data-save-scroll=true.
 * Handle to add mdlscrollto parameter to link using js when we click on the link.
 *
 */
export const initLinksScrollPos = () => {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-save-scroll=true]');
        if (!link) {
            return;
        }

        e.preventDefault();
        setPageUrlParam(e.target.href, 'mdlscrollto', getScrollPos(), true);
    });
};

/**
 * In the form that contains the element, set the value of the form field with
 * name mdlscrollto to the current scroll position. If there is no element with
 * that name, it creates a hidden form field with that name within the form.
 *
 * @param {string} elementId The element in the form.
 */
export const saveScrollPos = (elementId) => {
    const element = document.getElementById(elementId);
    const form = element.closest('form');
    if (!form) {
        return;
    }

    saveScrollPositionToForm(form);
};

/**
 * Save the position to form.
 *
 * @param {Object} form The form is saved scroll position.
 */
export const saveScrollPositionToForm = (form) => {
    getScrollPositionElement(form).value = getScrollPos();
};

/**
 * Saves scroll subject dataset id.
 *
 * @param {String} url Url to modify.
 * @param {String} className Class name attribute present on several elements.
 * @param {String} fallbackClassName Class name to look for if first one returns nothing.
 * @param {Bool} set Boolean to set url as new url in current window.
 * @return {*} Url with appended parameters if subject found.
 */
export const saveScrollSubject = (url, className, fallbackClassName, set) => {
    // Getting li element so we can check for bottom element visibility.
    const collection = document.getElementsByClassName(className);
    const positiveCollection = new Array();
    collection.forEach((element) => {
        if (element.getBoundingClientRect().bottom >= 0) {
            positiveCollection.push(element);
        }
    });
    // Adds some validation, ie: if we are in a course view that is a social format.
    if (positiveCollection.length !== 0) {
        return setPageUrlParam(url, 'scrollsubjectid', positiveCollection[0].dataset.id, set);
    }
    // If we precised a fallback classname, following logic will add it to url.
    if (positiveCollection.length === 0 && fallbackClassName !== '' && fallbackClassName !== undefined) {
        const fallbackCollection = document.getElementsByClassName(fallbackClassName);
        fallbackCollection.forEach((element) => {
            if (element.getBoundingClientRect().bottom >= 0) {
                positiveCollection.push(element);
            }
        });
        return setPageUrlParam(url, 'fallbackscrsubjectid', positiveCollection[0].dataset.id, set);
    }
    // If no match found return unchanged url.
    return url;
};

/**
 * If there is a parameter like mdlscrollto=123 in the URL, scroll to that saved position.
 */
export const scrollToSavedPosition = () => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('mdlscrollto')) {
        return;
    }

    const scrollPosition = url.searchParams.get('mdlscrollto');

    // Event onDOMReady is the effective one here. I am leaving the immediate call to
    // window.scrollTo in case it reduces flicker.
    const scrollingElement = getScrollingElement();
    scrollingElement.scrollTo(0, scrollPosition);
    document.addEventListener('DOMContentLoaded', () => {
        scrollingElement.scrollTo(0, scrollPosition);
    });
};

/**
 * If there is a parameter like scrollsubjectid=123, or fallbackscrsubjectid=24 in the URL, scroll to that saved subject or
 * fallback class.
 * In some cases y-position cannot be obtained accurately, an example of this is using the
 * edit mode switch in a course view, collapsed course will not have same y positions for
 * a different subject when not collapsed.
 *
 * @param {String} className Class name attribute present on several elements.
 * @param {String} fallbackClassName Class name to look for if first one returns nothing.
 * @param {String} selectorHighlight Selector to highlight in addition to a data-id element ie: li.courseindex-item for
 * li.courseindex-item[data-id=scrollsubjectid]
 */
export const scrollToSavedSubject = (className, fallbackClassName, selectorHighlight) => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('scrollsubjectid') && !url.searchParams.has('fallbackscrsubjectid')) {
        return;
    }
    // Retrieving a data-id;
    const scrollSubjectId = url.searchParams.get('scrollsubjectid');
    const fallbackScrSubjectId = url.searchParams.get('fallbackscrsubjectid');
    const scrollPosition = findScrollPosition(scrollSubjectId, fallbackScrSubjectId, className, fallbackClassName);
    // Event onDOMReady is the effective one here. I am leaving the immediate call to
    // window.scrollTo in case it reduces flicker.
    const scrollingElement = getScrollingElement();
    scrollingElement.scrollTo(0, scrollPosition);
    // Specificity of course view, maybe this can be improved to be more general, else it may need to be moved.
    if (scrollSubjectId !== undefined && selectorHighlight !== undefined) {
        getIndexHighlight(scrollSubjectId, selectorHighlight).then((element) => {
            setIndexHighlight(element);
            return;
        }).catch(displayException);
    }
    // Issue with this call is that it seems not to be firing because registered to late, unsure where to add that call.
    document.addEventListener('DOMContentLoaded', () => {
        scrollingElement.scrollTo(0, scrollPosition);
    });
};

/**
 * Sets URL parameter in given url and returns url string.
 *
 * @param {String} url Url to modify.
 * @param {String} paramName Parameter name to add.
 * @param {*} paramValue Value for given parameter.
 * @param {Bool} set Boolean to set url as new url in current window.
 * @returns {String} Url with newly added parameters.
 */
export const setPageUrlParam = (url, paramName, paramValue, set) => {
    const parsedUrl = new URL(url);
    const params = new URLSearchParams(parsedUrl.search);
    params.set(paramName, paramValue);
    parsedUrl.search = params.toString();
    if (set) {
        window.location = parsedUrl;
    }
    return parsedUrl.toString();
};

/**
 * Init event handlers for all links with data-savescrollposition=true.
 * Set the value to the closest form.
 */
export const watchScrollButtonSaves = () => {
    document.addEventListener('click', (e) => {
        const button = e.target.closest('[data-savescrollposition="true"]');
        if (button) {
            saveScrollPositionToForm(button.form);
        }
    });
};
