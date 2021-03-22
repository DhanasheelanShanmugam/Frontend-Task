import {
  DragHelper,
  Scheduler,
  WidgetHelper,
  Toast,
  CrudManager,
  SchedulerEventModel,
} from "../../build/schedulerpro.module.js"
import shared from "../_shared/shared.module.js"

const cookie = "PHPSESSID=schedulerpro-crudmanager"
if (!document.cookie.includes(cookie)) {
  document.cookie = `${cookie}-${Math.random().toString(16).substring(2)}`
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
})

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
            // Adding a query string parameter 
            // "...&reset=1" 
            // to let server know that we want to reset the database
            request: {
              params: {
                reset: 1,
              },
            },
          })
          .then(() => WidgetHelper.toast("Database was reset"))
          .catch(() => WidgetHelper.toast("Database reset failed"))
      },
    },
  ],
})

const e = React.createElement

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
]

class SideMenu extends React.Component {
  constructor(props) {
    super(props)

    this.state = { unplannedItems }

    this.onDrag = this.onDrag.bind(this)
 }

  onDrag(index, event, data) {
    const jsonArray = scheduler.eventStore.toJSON()

    let droppedTask = new SchedulerEventModel({
      startDate: "2018-05-01T08:00:00",
      durationUnit: "hour",
      duration: data.duration,
      name: data.name,
      id: jsonArray.length + 1,
      resourceId: 1,
    })

    if (!jsonArray.some((person) => person.name === data.name)) {
      scheduler.crudManager.sync()
      scheduler.crudManager.load({
        // Adding a query string parameter 
        // "...&reset=1" 
        // to let server know that we want to reset the database
        request: {
          params: {
            data: jsonArray,
          },
        },
      });
      scheduler.eventStore.add(droppedTask);
    }
    
    this.setState({ unplannedItems: this.state.unplannedItems.filter((_, idx) => idx != index) })
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
    )
  }
}

const domContainer = document.querySelector("#sideMenu")
ReactDOM.render(e(SideMenu), domContainer)
