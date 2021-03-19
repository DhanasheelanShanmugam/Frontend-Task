import '../_shared/shared.js'; // not required, our example styling etc.
import Splitter from '../../lib/Core/widget/Splitter.js';

import UnplannedGrid from './lib/UnplannedGrid.js';
import Schedule from './lib/Schedule.js';
import Drag from './lib/Drag.js';
import Task from './lib/Task.js';
import TaskStore from './lib/TaskStore.js';

let schedule = new Schedule({
    ref         : 'schedule',
    insertFirst : 'main',
    startDate   : new Date(2025, 11, 1, 8),
    endDate     : new Date(2025, 11, 1, 18),
    flex        : 1,
    crudManager : {
        autoLoad   : true,
        eventStore : {
            storeClass : TaskStore
        },
        transport : {
            load : {
                url : 'data/data.json'
            }
        }
    },

    tbar : [
        'Schedule view',
        '->',
        {
            type        : 'button',
            toggleable  : true,
            icon        : 'b-fa-calendar',
            pressedIcon : 'b-fa-calendar-check',
            text        : 'Automatic rescheduling',
            tooltip     : 'Toggles whether to automatically reschedule overlapping tasks',
            cls         : 'reschedule-button',
            onClick({ source : button }) {
                schedule.autoRescheduleTasks = button.pressed;
            }
        },
        {
            type        : 'buttonGroup',
            toggleGroup : true,
            items       : [
                {
                    icon    : 'b-fa-arrows-alt-v',
                    pressed : 'up.isVertical',
                    tooltip : 'Vertical mode',
                    onToggle({ pressed }) {
                        if (pressed) {
                            const config = schedule.initialConfig;

                            schedule.destroy();

                            schedule = new Schedule(Object.assign(config, {
                                mode : 'vertical'
                            }));

                            drag.schedule = schedule;
                        }
                    }
                },
                {
                    icon    : 'b-fa-arrows-alt-h',
                    pressed : 'up.isHorizontal',
                    tooltip : 'Horizontal mode',
                    onToggle({ pressed }) {
                        if (pressed) {
                            const config = schedule.initialConfig;

                            schedule.destroy();

                            schedule = new Schedule(Object.assign(config, {
                                mode : 'horizontal'
                            }));

                            drag.schedule = schedule;
                        }
                    }
                }
            ]
        }
    ]
});

new Splitter({
    appendTo : 'main'
});

const unplannedGrid = new UnplannedGrid({
    ref      : 'unplanned',
    appendTo : 'main',
    // Schedulers stores are contained by a project, pass it to the grid to allow it to access them
    project  : schedule.project,
    flex     : '0 1 300px',
    store    : {
        modelClass : Task,
        readUrl    : 'data/unplanned.json',
        autoLoad   : true
    },
    tbar : [
        'Grid view'
    ]

});

const drag = new Drag({
    grid         : unplannedGrid,
    schedule     : schedule,
    constrain    : false,
    outerElement : unplannedGrid.element
});
