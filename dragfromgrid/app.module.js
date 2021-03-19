import { DragHelper, DomHelper, Rectangle, WidgetHelper, Combo, Scheduler, SchedulerEventModel, DateHelper, SchedulerEventStore, Grid, Splitter } from '../../build/schedulerpro.module.js';
import shared from '../_shared/shared.module.js';

class Drag extends DragHelper {
    static get defaultConfig() {
        return {
            // Don't drag the actual row element, clone it
            cloneTarget        : true,
            mode               : 'translateXY',
            // Only allow drops on the schedule area
            dropTargetSelector : '.b-timeline-subgrid',
            // Only allow drag of row elements inside on the unplanned grid
            targetSelector     : '.b-grid-row:not(.b-group-row)'
        };
    }

    construct(config) {
        const me = this;

        super.construct(config);

        me.on({
            dragstart : me.onTaskDragStart,
            drag      : me.onTaskDrag,
            drop      : me.onTaskDrop,
            thisObj   : me
        });
    }

    onTaskDragStart({ context }) {
        const
            me           = this,
            { schedule } = me,
            mouseX       = context.clientX,
            proxy        = context.element,
            task         = me.grid.getRecordFromElement(context.grabbed),
            newSize      = me.schedule.timeAxisViewModel.getDistanceForDuration(task.durationMS);

        // save a reference to the task so we can access it later
        context.task = task;

        // Mutate dragged element (grid row) into an event bar
        proxy.classList.remove('b-grid-row');
        proxy.classList.add('b-sch-event-wrap');
        proxy.classList.add('b-unassigned-class');
        proxy.classList.add(`b-${schedule.mode}`);
        proxy.innerHTML = `<i class="${task.iconCls}"></i> ${task.name}`;

        me.schedule.enableScrollingCloseToEdges(me.schedule.timeAxisSubGrid);

        if (schedule.isHorizontal) {
            // If the new width is narrower than the grabbed element...
            if (context.grabbed.offsetWidth > newSize) {
                const proxyRect = Rectangle.from(context.grabbed);

                // If the mouse is off (nearly or) the end, centre the element on the mouse
                if (mouseX > proxyRect.x + newSize - 20) {
                    context.newX = context.elementStartX = context.elementX = mouseX - newSize / 2;
                    DomHelper.setTranslateX(proxy, context.newX);
                }
            }

            proxy.style.width = `${newSize}px`;
        }
        else {
            const width = schedule.resourceColumns.columnWidth;

            // Always center horizontal under mouse for vertical mode
            context.newX = context.elementStartX = context.elementX = mouseX - width / 2;
            DomHelper.setTranslateX(proxy, context.newX);

            proxy.style.width = `${width}px`;
            proxy.style.height = `${newSize}px`;
        }

        // Prevent tooltips from showing while dragging
        schedule.element.classList.add('b-dragging-event');
    }

    onTaskDrag({ event, context }) {
        const
            me         = this,
            coordinate = DomHelper[`getTranslate${me.schedule.isHorizontal ? 'X' : 'Y'}`](context.element),
            date       = me.schedule.getDateFromCoordinate(coordinate, 'round', false),
            // Coordinates required when used in vertical mode, since it does not use actual columns
            resource   = context.target && me.schedule.resolveResourceRecord(context.target, [event.offsetX, event.offsetY]);

        // Don't allow drops anywhere, only allow drops if the drop is on the timeaxis and on top of a Resource
        context.valid = context.valid && Boolean(date && resource);

        // Save reference to resource so we can use it in onTaskDrop
        context.resource = resource;
    }

    // Drop callback after a mouse up, take action and transfer the unplanned task to the real SchedulerEventStore (if it's valid)
    onTaskDrop({ context, event }) {
        const
            me               = this,
            { task, target } = context;

        me.schedule.disableScrollingCloseToEdges(me.schedule.timeAxisSubGrid);

        // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
        if (context.valid && target) {
            const
                coordinate = DomHelper[`getTranslate${me.schedule.isHorizontal ? 'X' : 'Y'}`](context.element),
                date = me.schedule.getDateFromCoordinate(coordinate, 'round', false),
                // Try resolving event record from target element, to determine if drop was on another event
                targetEventRecord = me.schedule.resolveEventRecord(context.target);

            if (date) {
                // Remove from grid first so that the data change
                // below does not fire events into the grid.
                me.grid.store.remove(task);

                //task.setStartDate(date, true);
                task.startDate = date;
                task.resource  = context.resource;
                me.schedule.eventStore.add(task);
            }

            // Dropped on a scheduled event, display toast
            if (targetEventRecord) {
                WidgetHelper.toast(`Dropped on ${targetEventRecord.name}`);
            }

            me.context.finalize();
        }
        else {
            me.abort();
        }

        me.schedule.element.classList.remove('b-dragging-event');
    }
};


// Custom combo containing icons to pick from
class IconCombo extends Combo {

    static get type() {
        return 'iconcombo';
    }

    static get defaultConfig() {
        return {
            items : [
                { value : 'b-fa b-fa-asterisk', text : 'Asterisk' },
                { value : 'b-fa b-fa-fw b-fa-beer', text : 'Beer' },
                { value : 'b-fa b-fa-fw b-fa-book', text : 'Book' },
                { value : 'b-fa b-fa-fw b-fa-bug', text : 'Bug' },
                { value : 'b-fa b-fa-building', text : 'Building' },
                { value : 'b-fa b-fa-coffee', text : 'Coffee' },
                { value : 'b-fa b-fa-fw b-fa-cog', text : 'Cog' },
                { value : 'b-fa b-fa-fw b-fa-dumbbell', text : 'Dumbbell' },
                { value : 'b-fa b-fa-laptop', text : 'Laptop' },
                { value : 'b-fa b-fa-fw b-fa-plane', text : 'Plane' },
                { value : 'b-fa b-fa-fw b-fa-phone', text : 'Phone' },
                { value : 'b-fa b-fa-fw b-fa-question', text : 'Question' },
                { value : 'b-fa b-fa-fw b-fa-life-ring', text : 'Ring' },
                { value : 'b-fa b-fa-sync', text : 'Sync' },
                { value : 'b-fa b-fa-user', text : 'User' },
                { value : 'b-fa b-fa-users', text : 'Users' },
                { value : 'b-fa b-fa-video', text : 'Video' }
            ],

            listItemTpl : item => `<i class="${item.value}" style="margin-right: .5em"></i>${item.text}`
        };
    }

    syncInputFieldValue(...args) {
        this.icon.className = this.value;
        super.syncInputFieldValue(...args);
    }

    get innerElements() {
        return [
            {
                reference : 'icon',
                tag       : 'i',
                className : 'b-fa b-fa-cog',
                style     : {
                    marginLeft  : '.8em',
                    marginRight : '-.3em'
                }
            },
            ...super.innerElements
        ];
    }
}

// Register class to be able to create widget by type
IconCombo.initClass();


class Schedule extends Scheduler {
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

/* eslint-disable no-unused-vars */

class Task extends SchedulerEventModel {
    static get defaults() {
        return {
            // In this demo, default duration for tasks will be hours (instead of days)
            durationUnit : 'h',

            // Use a default name, for better look in the grid if unassigning a new event
            name : 'New event',

            // Use a default icon also
            iconCls : 'b-fa b-fa-asterisk'
        };
    }
}


class TaskStore extends SchedulerEventStore {
    static get defaultConfig() {
        return {
            modelClass : Task
        };
    }

    // Override add to reschedule any overlapping events caused by the add
    add(records, silent = false) {
        const me = this;

        if (me.autoRescheduleTasks) {
            // Flag to avoid rescheduling during rescheduling
            me.isRescheduling = true;
            me.beginBatch();
        }

        if (!Array.isArray(records)) {
            records = [records];
        }

        super.add(records, silent);

        if (me.autoRescheduleTasks) {
            me.endBatch();
            me.isRescheduling = false;
        }
    }

    // Auto called when triggering the update event.
    // Reschedule if the update caused the event to overlap any others.
    onUpdate({ record }) {
        if (this.autoRescheduleTasks && !this.isRescheduling)  {
            this.rescheduleOverlappingTasks(record);
        }
    }

    rescheduleOverlappingTasks(eventRecord) {
        if (eventRecord.resource) {
            const
                futureEvents  = [],
                earlierEvents = [];

            // Split tasks into future and earlier tasks
            eventRecord.resource.events.forEach(event => {
                if (event !== eventRecord) {
                    if (event.startDate >= eventRecord.startDate) {
                        futureEvents.push(event);
                    }
                    else {
                        earlierEvents.push(event);
                    }
                }
            });

            if (futureEvents.length || earlierEvents.length) {
                futureEvents.sort((a, b) => a.startDate > b.startDate ? 1 : -1);
                earlierEvents.sort((a, b) => a.startDate > b.startDate ? -1 : 1);

                futureEvents.forEach((ev, i) => {
                    const prev = futureEvents[i - 1] || eventRecord;

                    ev.startDate = DateHelper.max(prev.endDate, ev.startDate);
                });

                // Walk backwards and remove any overlap
                [eventRecord, ...earlierEvents].forEach((ev, i, all) => {
                    const prev = all[i - 1];

                    if (ev.endDate > Date.now() && ev !== eventRecord && prev) {
                        ev.setEndDate(DateHelper.min(prev.startDate, ev.endDate), true);
                    }
                });

                this.isRescheduling = false;
            }
        }
    }
};

/* eslint-disable no-unused-vars */

class UnplannedGrid extends Grid {
    /**
     * Original class name getter. See Widget.$name docs for the details.
     * @return {string}
     */
    static get $name() {
        return 'UnplannedGrid';
    }

    // Factoryable type name
    static get type() {
        return 'unplannedgrid';
    }

    static get defaultConfig() {
        return {
            features : {
                stripe : true,
                sort   : 'name'
            },

            columns : [{
                text       : 'Unassigned tasks',
                flex       : 1,
                field      : 'name',
                htmlEncode : false,
                renderer   : (data) => `<i class="${data.record.iconCls}"></i>${data.record.name}`
            }, {
                text     : 'Duration',
                width    : 100,
                align    : 'right',
                editor   : false,
                field    : 'duration',
                renderer : (data) => `${data.record.duration} ${data.record.durationUnit}`
            }],

            rowHeight : 50
        };
    }

    construct(config) {
        super.construct(config);

        this.project.assignmentStore.on({
            // When a task is unassigned move it back to the unplanned tasks grid
            remove({ records }) {
                records.forEach(assignment => {
                    this.project.eventStore.remove(assignment.event);
                    this.store.add(assignment.event);
                });
            },
            thisObj : this
        });
    }
};

// Register this widget type with its Factory
UnplannedGrid.initClass();


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
