import {
  DragHelper,
  Scheduler,
  WidgetHelper,
  Toast,
  CrudManager,
  SchedulerEventModel,
} from "../../build/schedulerpro.module.js";
import shared from "../_shared/shared.module.js";

const cookie = "PHPSESSID=schedulerpro-crudmanager";
if (!document.cookie.includes(cookie)) {
  document.cookie = `${cookie}-${Math.random().toString(16).substring(2)}`;
}

class Drag extends DragHelper {
  static get defaultConfig() {
    return {
      // Don't drag the actual row element, clone it
      cloneTarget: true,
      mode: "translateXY",
      // Only allow drops on the schedule area
      dropTargetSelector: ".b-timeline-subgrid",
      // Only allow drag of row elements inside on the unplanned grid
      targetSelector: ".b-grid-row:not(.b-group-row)",
    };
  }

  construct(config) {
    const me = this;

    super.construct(config);

    me.on({
      dragstart: me.onTaskDragStart,
      drag: me.onTaskDrag,
      drop: me.onTaskDrop,
      thisObj: me,
    });
  }

  onTaskDragStart({ context }) {
    const me = this,
      { schedule } = me,
      mouseX = context.clientX,
      proxy = context.element,
      task = me.grid.getRecordFromElement(context.grabbed),
      newSize = me.schedule.timeAxisViewModel.getDistanceForDuration(
        task.durationMS
      );

    // save a reference to the task so we can access it later
    context.task = task;

    // Mutate dragged element (grid row) into an event bar
    proxy.classList.remove("b-grid-row");
    proxy.classList.add("b-sch-event-wrap");
    proxy.classList.add("b-unassigned-class");
    proxy.classList.add(`b-${schedule.mode}`);
    proxy.innerHTML = `<i class="${task.iconCls}"></i> ${task.name}`;

    me.schedule.enableScrollingCloseToEdges(me.schedule.timeAxisSubGrid);

    if (schedule.isHorizontal) {
      // If the new width is narrower than the grabbed element...
      if (context.grabbed.offsetWidth > newSize) {
        const proxyRect = Rectangle.from(context.grabbed);

        // If the mouse is off (nearly or) the end, centre the element on the mouse
        if (mouseX > proxyRect.x + newSize - 20) {
          context.newX = context.elementStartX = context.elementX =
            mouseX - newSize / 2;
          DomHelper.setTranslateX(proxy, context.newX);
        }
      }

      proxy.style.width = `${newSize}px`;
    } else {
      const width = schedule.resourceColumns.columnWidth;

      // Always center horizontal under mouse for vertical mode
      context.newX = context.elementStartX = context.elementX =
        mouseX - width / 2;
      DomHelper.setTranslateX(proxy, context.newX);

      proxy.style.width = `${width}px`;
      proxy.style.height = `${newSize}px`;
    }

    // Prevent tooltips from showing while dragging
    schedule.element.classList.add("b-dragging-event");
  }

  onTaskDrag({ event, context }) {
    const me = this,
      coordinate = DomHelper[
        `getTranslate${me.schedule.isHorizontal ? "X" : "Y"}`
      ](context.element),
      date = me.schedule.getDateFromCoordinate(coordinate, "round", false),
      // Coordinates required when used in vertical mode, since it does not use actual columns
      resource =
        context.target &&
        me.schedule.resolveResourceRecord(context.target, [
          event.offsetX,
          event.offsetY,
        ]);

    // Don't allow drops anywhere, only allow drops if the drop is on the timeaxis and on top of a Resource
    context.valid = context.valid && Boolean(date && resource);

    // Save reference to resource so we can use it in onTaskDrop
    context.resource = resource;
  }

  // Drop callback after a mouse up, take action and transfer the unplanned task to the real SchedulerEventStore (if it's valid)
  onTaskDrop({ context, event }) {
    const me = this,
      { task, target } = context;

    me.schedule.disableScrollingCloseToEdges(me.schedule.timeAxisSubGrid);

    // If drop was done in a valid location, set the startDate and transfer the task to the Scheduler event store
    if (context.valid && target) {
      const coordinate = DomHelper[
          `getTranslate${me.schedule.isHorizontal ? "X" : "Y"}`
        ](context.element),
        date = me.schedule.getDateFromCoordinate(coordinate, "round", false),
        // Try resolving event record from target element, to determine if drop was on another event
        targetEventRecord = me.schedule.resolveEventRecord(context.target);

      if (date) {
        // Remove from grid first so that the data change
        // below does not fire events into the grid.
        me.grid.store.remove(task);

        //task.setStartDate(date, true);
        task.startDate = date;
        task.resource = context.resource;
        me.schedule.eventStore.add(task);
      }

      // Dropped on a scheduled event, display toast
      if (targetEventRecord) {
        WidgetHelper.toast(`Dropped on ${targetEventRecord.name}`);
      }

      me.context.finalize();
    } else {
      me.abort();
    }

    me.schedule.element.classList.remove("b-dragging-event");
  }
}

const customCrudManager = new CrudManager({
  resourceStore: {
    // Add some custom fields
    fields: ["car", "dt"],
  },

  eventStore: {
    // Add a custom field and redefine durationUnit to default to hours
    fields: ["dt", { name: "durationUnit", defaultValue: "hour" }],
  },

  transport: {
    load: {
      url: "php/read.php",
      paramName: "data",
    },
    sync: {
      url: "php/sync.php",
    },
  },

  autoLoad: true,
  autoSync: true,
  onRequestFail: (event) => {
    const { requestType, response } = event,
      serverMessage = response && response.message,
      exceptionText = `Action "${requestType}" failed. ${
        serverMessage ? ` Server response: ${serverMessage}` : ""
      }`;

    Toast.show({
      html: exceptionText,
      color: "b-red",
      style: "color:white",
      timeout: 3000,
    });

    console.error(exceptionText);
  },
});

const scheduler = new Scheduler({
  appendTo: "container",
  minHeight: "20em",
  startDate: new Date(2018, 4, 21, 6),
  endDate: new Date(2018, 4, 21, 18),
  viewPreset: "hourAndDay",
  rowHeight: 50,
  barMargin: 5,
  eventColor: "orange",
  eventStyle: "colored",

  features: {
    // Configure event editor to display 'brand' as resource name
    eventEdit: {
      resourceFieldConfig: {
        displayField: "car",
      },
    },
  },

  columns: [
    { text: "Id", field: "id", width: 100, editor: false, hidden: true },
    { text: "Car", field: "car", width: 150 },
    {
      type: "date",
      text: "Modified",
      field: "dt",
      width: 90,
      format: "HH:mm:ss",
      editor: false,
      hidden: true,
    },
  ],

  crudManager: customCrudManager,

  tbar: [
    {
      type: "button",
      ref: "reloadButton",
      icon: "b-fa b-fa-sync",
      text: "Reload scheduler",
      onAction() {
        scheduler.crudManager
          .load()
          .then(() => WidgetHelper.toast("Data reloaded"))
          .catch(() => WidgetHelper.toast("Loading failed"));
      },
    },
    {
      type: "button",
      ref: "resetButton",
      color: "b-red",
      icon: "b-fa b-fa-recycle",
      text: "Reset database",
      onAction() {
        scheduler.crudManager
          .load({
            // Adding a query string parameter "...&reset=1" to let server know that we want to reset the database
            request: {
              params: {
                reset: 1,
              },
            },
          })
          .then(() => WidgetHelper.toast("Database was reset"))
          .catch(() => WidgetHelper.toast("Database reset failed"));
      },
    },
  ],
});

const e = React.createElement;

const unplannedItems = [
  {
    id: 1,
    name: "Fun task",
    duration: 4,
    durationUnit: "h",
    iconCls: "b-fa b-fa-fw b-fa-beer",
  },
  {
    id: 2,
    name: "Medium fun task",
    duration: 8,
    durationUnit: "h",
    iconCls: "b-fa b-fa-fw b-fa-cog",
  },
  {
    id: 3,
    name: "Outright boring task",
    duration: 2,
    durationUnit: "h",
    iconCls: "b-fa b-fa-fw b-fa-book",
  },
  {
    id: 4,
    name: "Inspiring task",
    duration: 2,
    durationUnit: "h",
    iconCls: "b-fa b-fa-fw b-fa-book",
  },
  {
    id: 5,
    name: "Mysterious task",
    duration: 2,
    durationUnit: "h",
    iconCls: "b-fa b-fa-fw b-fa-question",
  },
  {
    id: 6,
    name: "Answer forum question",
    duration: 4,
    durationUnit: "h",
    iconCls: "b-fa b-fa-fw b-fa-life-ring",
  },
  {
    id: 7,
    name: "Gym",
    duration: 1,
    durationUnit: "h",
    iconCls: "b-fa b-fa-fw b-fa-dumbbell",
  },
  {
    id: 9,
    name: "Book flight",
    duration: 7,
    durationUnit: "h",
    iconCls: "b-fa b-fa-fw b-fa-plane",
  },
  {
    id: 10,
    name: "Customer support call",
    duration: 3,
    durationUnit: "h",
    iconCls: "b-fa b-fa-fw b-fa-phone",
  },
  {
    id: 11,
    name: "Angular bug fix",
    duration: 3,
    durationUnit: "h",
    iconCls: "b-fa b-fa-fw b-fa-bug",
  },
  {
    id: 12,
    name: "React feature fix",
    duration: 2,
    durationUnit: "h",
    iconCls: "b-fa b-fa-fw b-fa-cog",
  },
];

class SideMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = { unplannedItems };

    this.onDrag = this.onDrag.bind(this);
    console.log("onInit", scheduler.eventStore);

    // const jsonArray = scheduler.eventStore.toJSON();
    // scheduler.crudManager.load({
    //   // Adding a query string parameter "...&reset=1" to let server know that we want to reset the database
    //   request: {
    //     params: {
    //       data: jsonArray,
    //     },
    //   },
    // });
    // scheduler.eventStore.add(
    //   new SchedulerEventModel({
    //     startDate: "2018-05-21T08:00:00",
    //     durationUnit: "hour",
    //     duration: 2,
    //     name: "anbu",
    //     id: 10,
    //   })
    // );

    // console.log("onInit2", scheduler.eventStore);
  }

  onDrag(index, event, data) {
    console.log({ event });
    const jsonArray = scheduler.eventStore.toJSON();
    console.log("data", data);
    let droppedTask = new SchedulerEventModel({
      startDate: "2018-05-01T08:00:00",
      durationUnit: "hour",
      duration: data.duration,
      name: data.name,
      id: jsonArray.length + 1,
      resourceId: 1,
    });

    if (!jsonArray.some((person) => person.name === data.name)) {
      scheduler.crudManager.sync();
      scheduler.crudManager.load({
        // Adding a query string parameter "...&reset=1" to let server know that we want to reset the database
        request: {
          params: {
            data: jsonArray,
          },
        },
      });
      scheduler.eventStore.add(droppedTask);
    }
    const unplannedItems = this.state.unplannedItems.filter(
      (_, i) => i != index
    );
    this.setState({ unplannedItems });
    console.log("drag", scheduler.eventStore);
  }

  render() {
    return e(
      React.Fragment,
      null,
      e(
        "div",
        {
          className: "side-header",
        },
        e(
          "h1",
          {
            className: "heading",
          },
          "Side Panel"
        )
      ),
      e(
        "div",
        {
          className: "right-side-panel",
        },
        e(
          "ul",
          {
            className: "task-list",
          },
          this.state.unplannedItems.map((item, idx) =>
            e(
              "li",
              {
                draggable: true,
                key: idx,
                onDragEnd: (event) => this.onDrag(idx, event, item),
              },
              item.name,
              " \xA0",
              e(
                "span",
                { className: "float-right" },
                null,
                item.duration + item.durationUnit
              )
            )
          )
        )
      )
    );
  }
}

const domContainer = document.querySelector("#sideMenu");
ReactDOM.render(e(SideMenu), domContainer);
