/* eslint-disable no-unused-vars */
import Grid from '../../../lib/Grid/view/Grid.js';

export default class UnplannedGrid extends Grid {
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
