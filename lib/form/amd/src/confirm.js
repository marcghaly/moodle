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
 * Form confirmation module.
 *
 * @module     core_form/confirm
 * @copyright  2022 Matt Porritt <mattp@catalyst-au.net>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Notification from 'core/notification';
import ModalFactory from 'core/modal_factory';
import ModalEvents from 'core/modal_events';
import {get_string as getString} from 'core/str';
import Templates from 'core/templates';
import LoadingIcon from 'core/loadingicon';

/**
 * Module level variables.
 */
let modalObj;
let submitId;

const spinner = LoadingIcon.getIcon();
/**
 * Creates the confirmation modal.
 *
 * @private
 */
const createModal = async() => {
    try {
        const title = await getString('confirm', 'core_form');
        // Create the Modal.
        ModalFactory.create({
            type: ModalFactory.types.SAVE_CANCEL,
            title: title,
            body: spinner,
            large: true,
        }).done((modal) => {
            modalObj = modal;
            const root = modalObj.getRoot();

            modal.setButtonText('save', getString('confirm'));

            // Submit form on the save event of the modal.
            root.on(ModalEvents.save, () => {
                const form = document.getElementById(submitId);
                form.submit();
            });
        });
    } catch (error) {
        Notification.exception(error);
    }
};

/**
 * Updates the modal with content.
 *
 * @param {Array} confirmNotices The notice information.
 * @private
 */
const updateModal = async(confirmNotices) => {
    const context = {'notices': confirmNotices};

    modalObj.setBody(spinner);
    modalObj.show();

    // Load the modal body with the relevant confirmation messages.
    try {
        const object = await Templates.renderForPromise('core_form/modal_confirm', context);
        modalObj.setBody(object.html);
    } catch (error) {
        Notification.exception(error);
    }
};

/**
 * Handle the form submission event and gather the confirmation conditions.
 *
 * @param {event} event The form submission event.
 */
const formSubmit = (event) => {
    if (event.submitter.name === 'cancel') {
        return;
    }
    event.preventDefault();
    const form = event.target;
    let confirmNotices = [];

    // Get all form elements that have data confirm attributes.
    const confirmElements = form.querySelectorAll('[data-confirm]');

    // Build array of confirmation item labels and descriptions.
    confirmElements.forEach((element) => {
        if (!isConfirmableElement(element)) {
            return;
        }

        const {value, dataset: {confirm: valueToMatch}} = element;

        if (value == valueToMatch) {
            return;
        }

        let noticeData = {'label': element.labels[0].textContent.trim(), 'value': value};
        if (element.dataset.confirmdesc !== undefined) {
            noticeData.description = element.dataset.confirmdesc;
        }

        confirmNotices.push(noticeData);
    });

    if (confirmNotices.length) {
        // Call the modal to display the fields with confirmation messages.
        updateModal(confirmNotices);
        return;
    }

    // No confirmation messages apply, just submit the form.
    document.getElementById(submitId).submit();
};

/**
 * Check element is confirmarble.
 *
 * @param {element} element Element to confirm.
 * @returns {Boolean}
 */
const isConfirmableElement = (element) => {
    if (element.type === 'checkbox' && element.checked != Boolean(Number(element.dataset.confirm))
        || (typeof element.value !== 'undefined')) {
            return true;
        }
    return false;
};

/**
 * Initialise method for confirmation display.
 *
 * @param {String} formId The id of the form the confirmation applies to.
 */
export const init = (formId) => {
    submitId = formId;

    // Set up the modal to be used later.
    createModal();

    // Add submit event listener to the form.
    const form = document.getElementById(formId);
    form.addEventListener('submit', formSubmit);
};
