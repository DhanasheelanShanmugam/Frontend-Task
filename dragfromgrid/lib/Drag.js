import DragHelper from "../../../lib/Core/helper/DragHelper.js";
import DomHelper from "../../../lib/Core/helper/DomHelper.js";
import Rectangle from "../../../lib/Core/helper/util/Rectangle.js";
import WidgetHelper from "../../../lib/Core/helper/WidgetHelper.js";

export default class Drag extends DragHelper {
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
