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
 * JavaScript that will notify teacher or editing user a question may need negrading.
 *
 * @module     core_question/regrade_warning
 * @copyright  2023 Catalyst IT Canada
 * @author     GHALY Marc-Alexandre <marc-alexandreghaly@catalyst-ca.net>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {saveCancelPromise} from 'core/notification';
import {get_strings as getStrings} from 'core/str';
import Templates from 'core/templates';

/**
 * Initialises regrade warning
 */
export const init = () => {
    const submitButton = document.querySelector('#id_submitbutton');
    const updateButton = document.querySelector('#id_updatebutton');
    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        displayWarning(e);
    });
    updateButton.addEventListener('click', (e) => {
        e.preventDefault();
        displayWarning(e);
    });
};

const displayWarning = async(e) => {
    const strings = await getStrings([
        {
            key: 'savechanges',
            component: 'core',
        },
        {
            key: 'savechangesandcontinueediting',
            component: 'question',
        },
        {
            key: 'regradeanyway',
            component: 'question',
        },
    ]);
    const form = e.target.closest('form.mform');
    const saveLabel = e.target.id === 'id_updatebutton' ? strings[1] : strings[0];
    // Maintain continue edition feature.
    if (e.target.id === 'id_updatebutton') {
        const input = form.querySelector('input[name="updatebutton"]');
        input.setAttribute('value', 1);
    }
    try {
        await saveCancelPromise(
            strings[2],
            Templates.render('core_question/regrade_warning', {}),
            saveLabel
        );
        // Save pressed.
        form.submit();
    } catch {
        // Cancel pressed.
        return;
    }
};
