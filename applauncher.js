// const applications = await Service.import("applications")
const { query } = await Service.import("applications")


/** @param { import("types/service/applications").Application } app */
function Application_widget(app){
  return Widget.Button({
    attribute: { app },
    class_name: "application",
    on_primary_click: () => { 
      applauncher_button.set_active(false)
      app.launch() 
    },
    setup: (self) => {
      self.keybind("Return", () => { 
        applauncher_button.set_active(false)
        self.attribute.app.launch()
      })
    },
    child: Widget.Box({
          hexpand: true,
          vexpand: true,
          hpack: "center",
          vpack: "center",
      vertical: true,
      tooltipMarkup: app.description?.replace("&","&amp;") || "",
      children: [
        Widget.Icon({
          icon: app.icon_name !== null ? app.icon_name : app.name,
          vexpand: false,
          hpack: "center",
          vpack: "center",
          size: 42,
        }),
        Widget.Label({
          justification: "center",
          hpack: "center",
          vpack: "center",
          vexpand: true,
          wrap: true,
          use_markup: true,
          label: app.name || ""
        })
      ]
    })
  })
}

/** @param { import("types/service/applications").Application[] } applist */
function Create_apps(applist) {
  let newlist = []
  for( let i = 0; i <= applist.length; i += 3) {
    newlist.push(applist.slice(i,i+3))
  }
  return newlist
}

function Applauncher() {

  let apps = Create_apps(query(""))

  let list =  Widget.Box({
    class_name: "appbox",
    vertical: true,
    homogeneous: true,
    vpack: "start",
    vexpand: true,
    children: apps.map( apparray => Widget.Box({
      class_name: "approws",
      spacing:5,
      homogeneous: true,
      vexpand: false,
      vpack: "fill",
      children: apparray.map( app => Application_widget(app))
    }))
  })

  function Repopulate() {
    const newapps = Create_apps(query(""))
    list.children = newapps.map( apparray => Widget.Box({
      class_name: "approws",
      spacing:5,
      homogeneous: true,
      vexpand: false,
      vpack: "fill",
      children: apparray.map( app => Application_widget(app))
    }))
  }


  const searchbox = Widget.Entry({
      placeholder_text: "Applications",
      visibility: true,
      on_change: ({text}) => {
      list.children.forEach( innerArray => {
        if(innerArray.children.every( appwidget => !appwidget.attribute.app.match(text || ""))) {
          innerArray.visible = false  
        } else {
          innerArray.visible = true
        }
        innerArray.children.forEach( appwidget => appwidget.attribute.app.match(text || "") ? appwidget.visible = true : appwidget.visible = false ) 
      })
    },
      on_accept: () => {
        const flatlist = list.children.flatMap( (box) => box.children )
        const result = flatlist.filter( app => app.visible)
        if( result[0] ) {
          applauncher_button.set_active(false)
          result[0].attribute.app.launch()
        }
      } 
    })

  const box = Widget.Box({
    class_name: "applauncher",
    vertical: true,
    children: [
      searchbox,
      Widget.Scrollable({
        hscroll: "never",
        child: list
      })
    ]
  })

  box.hook(App, (_, windowname,  visible) => {
    if(windowname !== "applauncher")
      return

    if(visible){
      Repopulate()
      searchbox.text = ""
    }
  } )

  return box
}

export const applauncher_button = Widget.ToggleButton({
  class_name: "applauncher-button",
  on_toggled: () => { 
    App.ToggleWindow("applauncher") 
  },
  label: "",
})

export const applauncher_window = Widget.Window({
  name: "applauncher",
  class_name: "applauncher-window",
  keymode: "on-demand",
  visible: false,
  anchor: ["top","bottom","left"],
  margins: [ 0, 5, 5, 5],
  child: Applauncher(),
  setup: (self) => {
      self.keybind("Escape",() => applauncher_button.set_active(false))
    }
})
