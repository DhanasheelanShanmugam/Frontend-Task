"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var _bryntum$scheduler = bryntum.schedulerpro,
    DragHelper = _bryntum$scheduler.DragHelper,
    DomHelper = _bryntum$scheduler.DomHelper,
    Rectangle = _bryntum$scheduler.Rectangle,
    WidgetHelper = _bryntum$scheduler.WidgetHelper,
    Combo = _bryntum$scheduler.Combo,
    Scheduler = _bryntum$scheduler.Scheduler,
    SchedulerEventModel = _bryntum$scheduler.SchedulerEventModel,
    DateHelper = _bryntum$scheduler.DateHelper,
    SchedulerEventStore = _bryntum$scheduler.SchedulerEventStore,
    Grid = _bryntum$scheduler.Grid,
    Splitter = _bryntum$scheduler.Splitter;

var Drag = /*#__PURE__*/function (_DragHelper) {
  _inherits(Drag, _DragHelper);

  var _super = _createSuper(Drag);

  function Drag() {
    _classCallCheck(this, Drag);

    return _super.apply(this, arguments);
  }

  _createClass(Drag, [{
    key: "construct",
    value: function construct(config) {
      var me = this;

      _get(_getPrototypeOf(Drag.prototype), "construct", this).call(this, config);

      me.on({
        dragstart: me.onTaskDragStart,
        drag: me.onTaskDrag,
        drop: me.onTaskDrop,
        thisObj: me
      });
    }
  }, {
    key: "onTaskDragStart",
    value: function onTaskDragStart(_ref) {
      var context = _ref.context;
      var me = this,
          schedule = me.schedule,
          mouseX = context.clientX,
          proxy = context.element,
          task = me.grid.getRecordFromElement(context.grabbed),
          newSize = me.schedule.timeAxisViewModel.getDistanceForDuration(task.durationMS); // save a reference to the task so we can access it later

      context.task = task; // Mutate dragged element (grid row) into an event bar

      proxy.classList.remove('b-grid-row');
      proxy.classList.add('b-sch-event-wrap');
      proxy.classList.add('b-unassigned-class');
      proxy.classList.add("b-".concat(schedule.mode));
      proxy.innerHTML = "<i class=\"".concat(task.iconCls, "\"></i> ").concat(task.name);
      me.schedule.enableScrollingCloseToEdges(me.schedule.timeAxisSubGrid);

      if (schedule.isHorizontal) {
        // If the new width is narrower than the grabbed element...
        if (context.grabbed.offsetWidth > newSize) {
          var proxyRect = Rectangle.from(context.grabbed); // If the mouse is off (nearly or) the end, centre the element on the mouse

          if (mouseX > proxyRect.x + newSize - 20) {
            context.newX = context.elementStartX = context.elementX = mouseX - newSize / 2;
            DomHelper.setTranslateX(proxy, context.newX);
          }
        }

        proxy.style.width = "".concat(newSize, "px");
      } else {
        var width = schedule.resourceColumns.columnWidth; // Always center horizontal under mouse for vertical mode

        context.newX = context.elementStartX = context.elementX = mouseX - width / 2;
        DomHelper.setTranslateX(proxy, context.newX);
        proxy.style.width = "".concat(width, "px");
        proxy.style.height = "".concat(newSize, "px");
      } // Prevent tooltips from showing while dragging


      schedule.element.classList.add('b-dragging-event');
    }
  }, {
    key: "onTaskDrag",
    value: function onTaskDrag(_ref2) {
      var event = _ref2.event,
          context = _ref2.context;
      var me = this,
          coordinate = DomHelper["getTranslate".concat(me.schedule.isHorizontal ? 'X' : 'Y')](context.element),
          date = me.schedule.getDateFromCoordinate(coordinate, 'round', false),
          // Coordinates required when used in vertical mode, since it does not use actual columns
      resource = context.target && me.schedule.resolveResourceRecord(context.target, [event.offsetX, event.offsetY]); // Don't allow drops anywhere, only allow drops if the drop is on the timeaxis and on top of a Resource

      context.valid = context.valid && Boolean(date && resource); // Save reference to resource so we can use it in onTaskDrop

      context.resource = resource;
    } // Drop callback after a mouse up, take action and transfer the unplanned task to the real SchedulerEventStore (if it's valid)

  }, {
    key: "onTaskDrop",
    value: function onTaskDrop(_ref3) {
      var context = _ref3.context,
          event = _ref3.event;
      var me = this,
          task = context.task,
          target = context.target;
      me.schedule.disableScrollingCloseToEdges(me.schedule.timeAxisSubGrid); // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store

      if (context.valid && target) {
        var coordinate = DomHelper["getTranslate".concat(me.schedule.isHorizontal ? 'X' : 'Y')](context.element),
            date = me.schedule.getDateFromCoordinate(coordinate, 'round', false),
            // Try resolving event record from target element, to determine if drop was on another event
        targetEventRecord = me.schedule.resolveEventRecord(context.target);

        if (date) {
          // Remove from grid first so that the data change
          // below does not fire events into the grid.
          me.grid.store.remove(task); //task.setStartDate(date, true);

          task.startDate = date;
          task.resource = context.resource;
          me.schedule.eventStore.add(task);
        } // Dropped on a scheduled event, display toast


        if (targetEventRecord) {
          WidgetHelper.toast("Dropped on ".concat(targetEventRecord.name));
        }

        me.context.finalize();
      } else {
        me.abort();
      }

      me.schedule.element.classList.remove('b-dragging-event');
    }
  }], [{
    key: "defaultConfig",
    get: function get() {
      return {
        // Don't drag the actual row element, clone it
        cloneTarget: true,
        mode: 'translateXY',
        // Only allow drops on the schedule area
        dropTargetSelector: '.b-timeline-subgrid',
        // Only allow drag of row elements inside on the unplanned grid
        targetSelector: '.b-grid-row:not(.b-group-row)'
      };
    }
  }]);

  return Drag;
}(DragHelper);

; // Custom combo containing icons to pick from

var IconCombo = /*#__PURE__*/function (_Combo) {
  _inherits(IconCombo, _Combo);

  var _super2 = _createSuper(IconCombo);

  function IconCombo() {
    _classCallCheck(this, IconCombo);

    return _super2.apply(this, arguments);
  }

  _createClass(IconCombo, [{
    key: "syncInputFieldValue",
    value: function syncInputFieldValue() {
      var _get2;

      this.icon.className = this.value;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      (_get2 = _get(_getPrototypeOf(IconCombo.prototype), "syncInputFieldValue", this)).call.apply(_get2, [this].concat(args));
    }
  }, {
    key: "innerElements",
    get: function get() {
      return [{
        reference: 'icon',
        tag: 'i',
        className: 'b-fa b-fa-cog',
        style: {
          marginLeft: '.8em',
          marginRight: '-.3em'
        }
      }].concat(_toConsumableArray(_get(_getPrototypeOf(IconCombo.prototype), "innerElements", this)));
    }
  }], [{
    key: "type",
    get: function get() {
      return 'iconcombo';
    }
  }, {
    key: "defaultConfig",
    get: function get() {
      return {
        items: [{
          value: 'b-fa b-fa-asterisk',
          text: 'Asterisk'
        }, {
          value: 'b-fa b-fa-fw b-fa-beer',
          text: 'Beer'
        }, {
          value: 'b-fa b-fa-fw b-fa-book',
          text: 'Book'
        }, {
          value: 'b-fa b-fa-fw b-fa-bug',
          text: 'Bug'
        }, {
          value: 'b-fa b-fa-building',
          text: 'Building'
        }, {
          value: 'b-fa b-fa-coffee',
          text: 'Coffee'
        }, {
          value: 'b-fa b-fa-fw b-fa-cog',
          text: 'Cog'
        }, {
          value: 'b-fa b-fa-fw b-fa-dumbbell',
          text: 'Dumbbell'
        }, {
          value: 'b-fa b-fa-laptop',
          text: 'Laptop'
        }, {
          value: 'b-fa b-fa-fw b-fa-plane',
          text: 'Plane'
        }, {
          value: 'b-fa b-fa-fw b-fa-phone',
          text: 'Phone'
        }, {
          value: 'b-fa b-fa-fw b-fa-question',
          text: 'Question'
        }, {
          value: 'b-fa b-fa-fw b-fa-life-ring',
          text: 'Ring'
        }, {
          value: 'b-fa b-fa-sync',
          text: 'Sync'
        }, {
          value: 'b-fa b-fa-user',
          text: 'User'
        }, {
          value: 'b-fa b-fa-users',
          text: 'Users'
        }, {
          value: 'b-fa b-fa-video',
          text: 'Video'
        }],
        listItemTpl: function listItemTpl(item) {
          return "<i class=\"".concat(item.value, "\" style=\"margin-right: .5em\"></i>").concat(item.text);
        }
      };
    }
  }]);

  return IconCombo;
}(Combo); // Register class to be able to create widget by type


IconCombo.initClass();

var Schedule = /*#__PURE__*/function (_Scheduler) {
  _inherits(Schedule, _Scheduler);

  var _super3 = _createSuper(Schedule);

  function Schedule() {
    _classCallCheck(this, Schedule);

    return _super3.apply(this, arguments);
  }

  _createClass(Schedule, [{
    key: "autoRescheduleTasks",
    set: function set(autoRescheduleTasks) {
      this.eventStore.autoRescheduleTasks = autoRescheduleTasks;
    }
  }], [{
    key: "$name",

    /**
     * Original class name getter. See Widget.$name docs for the details.
     * @return {string}
     */
    get: function get() {
      return 'Schedule';
    } // Factoryable type name

  }, {
    key: "type",
    get: function get() {
      return 'schedule';
    }
  }, {
    key: "defaultConfig",
    get: function get() {
      return {
        // Custom property for this demo, set to true to reschedule any conflicting tasks automatically
        autoRescheduleTasks: false,
        features: {
          stripe: true,
          timeRanges: true,
          eventMenu: {
            items: {
              // Custom item with inline handler
              unassign: {
                text: 'Unassign',
                icon: 'b-fa b-fa-user-times',
                weight: 200,
                onItem: function onItem(_ref4) {
                  var eventRecord = _ref4.eventRecord;
                  return eventRecord.unassign();
                }
              }
            }
          },
          eventEdit: {
            items: {
              // Custom field for picking icon
              iconCls: {
                type: 'iconcombo',
                // Name should match a record field, to read and write value from that field
                name: 'iconCls',
                label: 'Icon',
                weight: 200
              }
            }
          }
        },
        rowHeight: 50,
        barMargin: 4,
        eventColor: 'indigo',
        columns: [{
          type: 'resourceInfo',
          text: 'Name',
          width: 200,
          showEventCount: false,
          showRole: true
        }, {
          text: 'Nbr tasks',
          editor: false,
          renderer: function renderer(data) {
            return "".concat(data.record.events.length || '');
          },
          align: 'center',
          sortable: function sortable(a, b) {
            return a.events.length < b.events.length ? -1 : 1;
          },
          width: 100
        }],
        // Custom view preset with header configuration
        viewPreset: {
          base: 'hourAndDay',
          columnLinesFor: 0,
          headers: [{
            unit: 'd',
            align: 'center',
            dateFormat: 'ddd DD MMM'
          }, {
            unit: 'h',
            align: 'center',
            dateFormat: 'HH'
          }]
        },
        // Only used in vertical mode
        resourceColumns: {
          columnWidth: 120
        },
        // Do not remove event when unassigning, we want to add it to grid instead
        removeUnassignedEvent: false,
        resourceImagePath: '../_shared/images/users/'
      };
    }
  }]);

  return Schedule;
}(Scheduler);

;
Schedule.initClass();
/* eslint-disable no-unused-vars */

var Task = /*#__PURE__*/function (_EventModel) {
  _inherits(Task, _EventModel);

  var _super4 = _createSuper(Task);

  function Task() {
    _classCallCheck(this, Task);

    return _super4.apply(this, arguments);
  }

  _createClass(Task, null, [{
    key: "defaults",
    get: function get() {
      return {
        // In this demo, default duration for tasks will be hours (instead of days)
        durationUnit: 'h',
        // Use a default name, for better look in the grid if unassigning a new event
        name: 'New event',
        // Use a default icon also
        iconCls: 'b-fa b-fa-asterisk'
      };
    }
  }]);

  return Task;
}(SchedulerEventModel);

var TaskStore = /*#__PURE__*/function (_EventStore) {
  _inherits(TaskStore, _EventStore);

  var _super5 = _createSuper(TaskStore);

  function TaskStore() {
    _classCallCheck(this, TaskStore);

    return _super5.apply(this, arguments);
  }

  _createClass(TaskStore, [{
    key: "add",
    // Override add to reschedule any overlapping events caused by the add
    value: function add(records) {
      var silent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var me = this;

      if (me.autoRescheduleTasks) {
        // Flag to avoid rescheduling during rescheduling
        me.isRescheduling = true;
        me.beginBatch();
      }

      if (!Array.isArray(records)) {
        records = [records];
      }

      _get(_getPrototypeOf(TaskStore.prototype), "add", this).call(this, records, silent);

      if (me.autoRescheduleTasks) {
        me.endBatch();
        me.isRescheduling = false;
      }
    } // Auto called when triggering the update event.
    // Reschedule if the update caused the event to overlap any others.

  }, {
    key: "onUpdate",
    value: function onUpdate(_ref5) {
      var record = _ref5.record;

      if (this.autoRescheduleTasks && !this.isRescheduling) {
        this.rescheduleOverlappingTasks(record);
      }
    }
  }, {
    key: "rescheduleOverlappingTasks",
    value: function rescheduleOverlappingTasks(eventRecord) {
      if (eventRecord.resource) {
        var futureEvents = [],
            earlierEvents = []; // Split tasks into future and earlier tasks

        eventRecord.resource.events.forEach(function (event) {
          if (event !== eventRecord) {
            if (event.startDate >= eventRecord.startDate) {
              futureEvents.push(event);
            } else {
              earlierEvents.push(event);
            }
          }
        });

        if (futureEvents.length || earlierEvents.length) {
          futureEvents.sort(function (a, b) {
            return a.startDate > b.startDate ? 1 : -1;
          });
          earlierEvents.sort(function (a, b) {
            return a.startDate > b.startDate ? -1 : 1;
          });
          futureEvents.forEach(function (ev, i) {
            var prev = futureEvents[i - 1] || eventRecord;
            ev.startDate = DateHelper.max(prev.endDate, ev.startDate);
          }); // Walk backwards and remove any overlap

          [eventRecord].concat(earlierEvents).forEach(function (ev, i, all) {
            var prev = all[i - 1];

            if (ev.endDate > Date.now() && ev !== eventRecord && prev) {
              ev.setEndDate(DateHelper.min(prev.startDate, ev.endDate), true);
            }
          });
          this.isRescheduling = false;
        }
      }
    }
  }], [{
    key: "defaultConfig",
    get: function get() {
      return {
        modelClass: Task
      };
    }
  }]);

  return TaskStore;
}(SchedulerEventStore);

;
/* eslint-disable no-unused-vars */

var UnplannedGrid = /*#__PURE__*/function (_Grid) {
  _inherits(UnplannedGrid, _Grid);

  var _super6 = _createSuper(UnplannedGrid);

  function UnplannedGrid() {
    _classCallCheck(this, UnplannedGrid);

    return _super6.apply(this, arguments);
  }

  _createClass(UnplannedGrid, [{
    key: "construct",
    value: function construct(config) {
      _get(_getPrototypeOf(UnplannedGrid.prototype), "construct", this).call(this, config);

      this.project.assignmentStore.on({
        // When a task is unassigned move it back to the unplanned tasks grid
        remove: function remove(_ref6) {
          var _this = this;

          var records = _ref6.records;
          records.forEach(function (assignment) {
            _this.project.eventStore.remove(assignment.event);

            _this.store.add(assignment.event);
          });
        },
        thisObj: this
      });
    }
  }], [{
    key: "$name",

    /**
     * Original class name getter. See Widget.$name docs for the details.
     * @return {string}
     */
    get: function get() {
      return 'UnplannedGrid';
    } // Factoryable type name

  }, {
    key: "type",
    get: function get() {
      return 'unplannedgrid';
    }
  }, {
    key: "defaultConfig",
    get: function get() {
      return {
        features: {
          stripe: true,
          sort: 'name'
        },
        columns: [{
          text: 'Unassigned tasks',
          flex: 1,
          field: 'name',
          htmlEncode: false,
          renderer: function renderer(data) {
            return "<i class=\"".concat(data.record.iconCls, "\"></i>").concat(data.record.name);
          }
        }, {
          text: 'Duration',
          width: 100,
          align: 'right',
          editor: false,
          field: 'duration',
          renderer: function renderer(data) {
            return "".concat(data.record.duration, " ").concat(data.record.durationUnit);
          }
        }],
        rowHeight: 50
      };
    }
  }]);

  return UnplannedGrid;
}(Grid);

; // Register this widget type with its Factory

UnplannedGrid.initClass();
var schedule = new Schedule({
  ref: 'schedule',
  insertFirst: 'main',
  startDate: new Date(2025, 11, 1, 8),
  endDate: new Date(2025, 11, 1, 18),
  flex: 1,
  crudManager: {
    autoLoad: true,
    eventStore: {
      storeClass: TaskStore
    },
    transport: {
      load: {
        url: 'data/data.json'
      }
    }
  },
  tbar: ['Schedule view', '->', {
    type: 'button',
    toggleable: true,
    icon: 'b-fa-calendar',
    pressedIcon: 'b-fa-calendar-check',
    text: 'Automatic rescheduling',
    tooltip: 'Toggles whether to automatically reschedule overlapping tasks',
    cls: 'reschedule-button',
    onClick: function onClick(_ref7) {
      var button = _ref7.source;
      schedule.autoRescheduleTasks = button.pressed;
    }
  }, {
    type: 'buttonGroup',
    toggleGroup: true,
    items: [{
      icon: 'b-fa-arrows-alt-v',
      pressed: 'up.isVertical',
      tooltip: 'Vertical mode',
      onToggle: function onToggle(_ref8) {
        var pressed = _ref8.pressed;

        if (pressed) {
          var config = schedule.initialConfig;
          schedule.destroy();
          schedule = new Schedule(Object.assign(config, {
            mode: 'vertical'
          }));
          drag.schedule = schedule;
        }
      }
    }, {
      icon: 'b-fa-arrows-alt-h',
      pressed: 'up.isHorizontal',
      tooltip: 'Horizontal mode',
      onToggle: function onToggle(_ref9) {
        var pressed = _ref9.pressed;

        if (pressed) {
          var config = schedule.initialConfig;
          schedule.destroy();
          schedule = new Schedule(Object.assign(config, {
            mode: 'horizontal'
          }));
          drag.schedule = schedule;
        }
      }
    }]
  }]
});
new Splitter({
  appendTo: 'main'
});
var unplannedGrid = new UnplannedGrid({
  ref: 'unplanned',
  appendTo: 'main',
  // Schedulers stores are contained by a project, pass it to the grid to allow it to access them
  project: schedule.project,
  flex: '0 1 300px',
  store: {
    modelClass: Task,
    readUrl: 'data/unplanned.json',
    autoLoad: true
  },
  tbar: ['Grid view']
});
var drag = new Drag({
  grid: unplannedGrid,
  schedule: schedule,
  constrain: false,
  outerElement: unplannedGrid.element
});