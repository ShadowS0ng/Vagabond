// vim:fileencoding=utf-8:foldmethod=marker
// @ts-ignore
const systemtray = await Service.import("systemtray");
import { Workspaces, Tasklist } from "./hyprlandmodule.js";
import { Dashboard } from "./dashboard.js";
import { applauncher_window, applauncher_button } from "./applauncher.js";

// Clock{{{

function Calendar() {
  const box = Widget.Calendar({
    showDayNames: true,
    showDetails: false,
    showHeading: true,
    showWeekNumbers: true,
    
    detail: (_, y, m, d) => {
        return `<span color="white">${y}. ${m}. ${d}.</span>`
    },
  })

  const window = Widget.Window({
    margins: [5,5,5,5],
    class_name: "calendar",
    name: "calendar",
    anchor: ["bottom","right"],
    layer: "overlay",
    visible: false,
    child: box
  })

  return window
}

function Clock() {

  const time_var = Variable('',{
    poll:[10000, `sh -c "date '+%I:%M'"`]
  });

  const date_value = Utils.exec(`sh -c 'date "+%D"'`);
    return Widget.ToggleButton({
    on_toggled: () => { App.ToggleWindow("calendar") },
      child: Widget.Label({
        class_name: "clock",
        useMarkup: true,
        label: time_var.bind(),
        tooltip_markup: `<span font='Kalam Regular 14'>${date_value}</span>`,
      })
    })
};
//}}}

//systemtray{{{
function Systemtray() { 
    return Widget.Box({
    class_name: "systemtray",
    spacing: 1,
    vertical: false,
    homogeneous: false,
    children: systemtray.bind("items").as( items => items.map( item => Widget.Button({
        class_name: "tray_item",
      child: Widget.Icon({icon: item.bind("icon"), size: 16}),
      tooltip_markup: item.bind("tooltip_markup").as( text => text.replaceAll("&", "&amp;") ),
      on_primary_click: (_,event) => item.activate(event),
      on_secondary_click: (_, event) => item.openMenu(event),
    })))
  })
}
//}}}

let dashboard = Dashboard();


function Left() {
  return Widget.Box({ 
    spacing: 8,
    children: [applauncher_button,Workspaces(),Tasklist()],
  });
}

function Center(){
 return Widget.Box({
    spacing: 8,
    children: [],
  });
}

function Right(){
  return Widget.Box({
    sensitive: true,
    vertical: false,
    hpack: "end",
    spacing: 8,
    children: [ Systemtray(), Clock(), dashboard.button],
  })
}


function bar(monitor = 0) {
  return Widget.Window({
    monitor,
    name:`bar-${monitor}`,
    class_name: "bar",
    sensitive: true,
    margins: [ 4, 4, 4, 4],
    // layer: "overlay",
    anchor: ["bottom", "left", "right"],
    exclusivity: "exclusive",
    child: Widget.CenterBox({
      // hexpand: true,
      start_widget: Left(),
      center_widget: Center(),
      end_widget: Right(),
    })
  })
}

const css = "/tmp/ags_css.css"

const scss = `${App.configDir}/style.scss`

Utils.exec(`sassc ${scss} ${css}`)

Utils.monitorFile(
  scss,

  function() {
    Utils.exec(`sassc ${scss} ${css}`)
    App.resetCss();
    App.applyCss(css)
  }
)

App.config({
  style: css,
  windows:[
    bar(),
    dashboard.window,
    Calendar(),
    applauncher_window,
  ],
  // gtkTheme: "Orchis-Pink-New-Compact",
});

export { }
