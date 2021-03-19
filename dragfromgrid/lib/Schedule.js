import Scheduler from '../../../lib/Scheduler/view/Scheduler.js';
import '../../../lib/Grid/column/TemplateColumn.js';
import '../../../lib/Grid/feature/Stripe.js';
import '../../../lib/Grid/feature/Sort.js';
import '../../../lib/Scheduler/feature/TimeRanges.js';
import '../../../lib/Scheduler/feature/EventDrag.js';
import '../../../lib/Scheduler/feature/EventDragCreate.js';
import '../../../lib/Scheduler/feature/EventResize.js';
import '../../../lib/Scheduler/column/ResourceInfoColumn.js';
import './IconCombo.js';

export default class Schedule extends Scheduler {
    /**
     * Original class name getter. See Widget.$name docs for the details.
     * @return {string}
     */
    static get $name() {
        return 'Schedule';
    }

    // Factoryable type name
    static get type() {
        return 'schedule';
    }

    static get defaultConfig() {
        return {
            // Custom property for this demo, set to true to reschedule any conflicting tasks automatically
            autoRescheduleTasks : false,

            features : {
                stripe     : true,
                timeRanges : true,
                eventMenu  : {
                    items : {
                        // Custom item with inline handler
                        unassign : {
                            text   : 'Unassign',
                            icon   : 'b-fa b-fa-user-times',
                            weight : 200,
                            onItem : ({ eventRecord }) => eventRecord.unassign()
                        }
                    }
                },
                eventEdit : {
                    items : {
                        // Custom field for picking icon
                        iconCls : {
                            type   : 'iconcombo',
                            // Name should match a record field, to read and write value from that field
                            name   : 'iconCls',
                            label  : 'Icon',
                            weight : 200
                        }
                    }
                }
            },

            rowHeight  : 50,
            barMargin  : 4,
            eventColor : 'indigo',

            columns : [
                {
                    type           : 'resourceInfo',
                    text           : 'Name',
                    width          : 200,
                    showEventCount : false,
                    showRole       : true
                },
                {
                    text     : 'Nbr tasks',
                    editor   : false,
                    renderer : data => `${data.record.events.length || ''}`,
                    align    : 'center',
                    sortable : (a, b) => a.events.length < b.events.length ? -1 : 1,
                    width    : 100
                }
            ],

            // Custom view preset with header configuration
            viewPreset : {
                base           : 'hourAndDay',
                columnLinesFor : 0,
                headers        : [
                    {
                        unit       : 'd',
                        align      : 'center',
                        dateFormat : 'ddd DD MMM'
                    },
                    {
                        unit       : 'h',
                        align      : 'center',
                        dateFormat : 'HH'
                    }
                ]
            },

            // Only used in vertical mode
            resourceColumns : {
                columnWidth : 120
            },

            // Do not remove event when unassigning, we want to add it to grid instead
            removeUnassignedEvent : false,

            resourceImagePath : '../_shared/images/users/'
        };
    }

    set autoRescheduleTasks(autoRescheduleTasks) {
        this.eventStore.autoRescheduleTasks = autoRescheduleTasks;
    }
};

Schedule.initClass();
