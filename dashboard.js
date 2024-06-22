// @ts-ignore
// import Gtk from "gi://Gtk"
const audio = await Service.import("audio");
const weatherService = await import("./weatherService.js")
const cryptoService = await import("./cryptoService.js")
import brightness from "./Brightness.js"
const weatherModule = await import("./weatherWidget.js")
const mediaModule = await import("./mediaWidget.js")
const notificationModule = await import("./notificationPopups.js")
const notifications = await Service.import("notifications")
const cryptoModule = await import("./cryptoWidget.js")
notificationModule.NotificationPopups()

function updateWidgetsData(){
  cryptoService.default.updateList()
  weatherService.default.updateForecast()
  weatherService.default.updateRealtime()
}

Utils.interval(180000, ()=> {
  updateWidgetsData()
})

function Create_circularprogress({icon, color = '@theme_fg_color', value}){
  return Widget.CircularProgress({
      css: 'min-width: 80px;'  // its size is min(min-height, min-width)
            + 'min-height: 80px;'
            + 'font-size: 8px;' // to set its thickness set font-size on it
            + 'margin: 5px;' // you can set margin on it
            + 'background-color: @theme_base_color;' // set its bg color
            + `color: ${color};`, // set its fg color
      rounded: true,
      // inverted: true,
      value: value,
      child: Widget.Label({
        use_markup: true,
        label: `<span font="Symbols Nerd Font Regular 22" >${icon}</span>`
      })
    })
}


function Create_slider ({ icon, value, onChange, max = 100, min = 0}) {

  const _icon = Widget.Icon({
    icon: icon,
    size: 18,
  })

  const _slider = Widget.Slider({
    drawValue: false,
    min: min,
    max: max,
    value: value,
    hexpand: true,
    onChange: onChange,
  })

  return Widget.Box({
    class_name: "slider",
    vertical: false,
    spacing: 0,
    homogeneous: false,
    children: [_icon, _slider]
  })
  
}

const divide = ([total, free]) => (free / total).toPrecision(2)
const cpu = Variable('',{
  poll: [2000, 'top -b -n 1', out => divide([100, out.split('\n')
    .find( line => line.includes("Cpu(s)"))
    ?.split(/\s+/)[1]
    .replace(',','.')])],
})

const ram = Variable('', {
  //@ts-ignore
  poll: [2000, 'free', out => divide(out.split('\n')
    .find(line => line.includes('Mem:'))
    .split(/\s+/)
    .splice(1, 2))]
})

const temp = Variable('', {
  poll: [2000, 'sensors', out => divide([98,out.split("\n").find( line => line.includes("Package id 0:"))?.split(/\s+/)[3].replace(/[+C]/g,"").split(".")[0]])
  ]
})

cpu.stopPoll()
ram.stopPoll()
// disk.stopPoll()
temp.stopPoll()

const volume_icons = {
  101: "overamplified",
  67: "high",
  34: "medium",
  1: "low",
  0: "muted",
}

const brightness_icons = {
  0: "off",
  33: "low",
  74: "medium",
  100: "high",
}

const mic_icons = {
  0: "muted",
  33: "low",
  74: "medium",
  100: "high",
}

function get_volume_icon(){
  let icon = audio.speaker.is_muted ? 0 : [101, 67, 34, 1, 0].find( treshold => treshold <= audio.speaker.volume * 100)
  return `audio-volume-${volume_icons[icon]}-symbolic`
}

function get_brightness_icon() {
  const icon = [0, 33, 74, 100].find( treshold => brightness.screen_value * 100 <= treshold)
  return `display-brightness-${brightness_icons[icon]}-symbolic`
}

function get_mic_icon() {
  const icon = [0, 33, 74, 100].find( th => audio.microphone.volume * 100 <= th)
  return `microphone-sensitivity-${mic_icons[icon]}-symbolic`
}

const power_buttons = {
  // lockscreen: { cmd: "hyprlock --immediate", label: "", },
  // logout: { cmd: "loginctl kill-session self", label: "󰿅",},
  // reboot: { cmd: "reboot", label: "", },
  // shutdown: { cmd: "shutdown now", label: "", }
  lockscreen: { cmd: "hyprlock --immediate", icon: "system-lock-screen-symbolic", },
  logout: { cmd: "loginctl kill-session self", icon: "system-log-out-symbolic",},
  reboot: { cmd: "reboot", icon: "system-reboot-symbolic", },
  shutdown: { cmd: "shutdown now", icon: "system-shutdown-symbolic", }
}



export function Dashboard() {
  
const notificationCounter = Widget.Box(
  {
    class_name: "notification_counter",
    hpack: "end",
    vpack: "start",
  },
  Widget.Label({
    justification: "center",
    label: notifications.bind("notifications").as( notifications => notifications.length.toString() )
  })
)

const notificationsSwtich = Widget.Box(
    {
      class_name: "notifications_switch",
      hpack: "end",
      vpack: "start",
      hexpand: true,
    },
    Widget.Icon({
      // hexpand: false,
      icon: `preferences-system-symbolic`,
      size: 20,
      // css: `margin-left: 0.4em;`
          // +"margin-right: -0.4em;",
    }),
    Widget.Switch(
      {
        class_name: "notifications_switch",
        hexpand: false,
        on_activate: ({active}) => {
          active ? stackBox.shown = "notifications" : stackBox.shown = "dashboard"
        },
      },
    ),
    Widget.Overlay({
      child: Widget.Icon({
        // hexpand: false,
        icon: `notifications-symbolic`,
        size: 20,
        // css: "margin-right: 0.4em;"
            // +`margin-left: -0.5em;`,
      }),
      overlay: notificationCounter
    })
  )

const buttons_list = Widget.Revealer({
  revealChild: false,
  transition: "slide_up",
  transition_duration: 1200,
  // hexpand: false,
  hpack: "start",
  child: Widget.Box({
    class_name: "powerbutton_list",
    vertical: true,
    // vpack: "end",
    children: Object.values(power_buttons).map( pwfn => Widget.Button({
      on_primary_click: () => { Utils.exec(pwfn.cmd) },
      child: Widget.Icon({icon: pwfn.icon}),
    }))
  })
})

const powerbox = Widget.Box(
    {
      vertical: true,
      children: [
        Widget.ToggleButton({
        class_name: "power_button",
        // label: "",
        // hexpand: true,
        // vexpand: false,
        onToggled: () => { buttons_list.reveal_child = !buttons_list.reveal_child },
        child: Widget.Icon({
            icon: "system-shutdown-symbolic",
            size: 16
          })
        }),
      ].reverse()
    },
  )

const wifi = Widget.ToggleButton({
  class_name: "wifi_button",
  // hexpand: true,
  // vexpand: false,
  vpack: "start",
  onToggled: ({child,active}) => { 
      active ? Utils.execAsync("nmcli radio wifi on") : Utils.execAsync("nmcli radio wifi off") 
      if(active){
        child.icon = "network-wireless-symbolic"
      } else {
        child.icon = "network-wireless-offline"
      }
    },
  child: Widget.Icon({
      size: 16,
    }),
    setup: (self) => {
      Utils.execAsync("nmcli radio wifi").then( res => {
        if(res === "enabled"){
          self.child.icon = "network-wireless-symbolic"
          self.active = true
        } else {
          self.child.icon = "network-wireless-offline"
          self.active = false
        }
      })
    }
})

const controls = Widget.Box({
  class_name: "controls",
  // vertical: true,
  // vexpand: true,
  // hpack: "start",
  // vpack: "start"
  hexpand: true,
  children: [
    Widget.Box(
      {
          // hexpand: true,
          homogeneous: true,
      },
      powerbox,
      wifi,
    ),
    notificationsSwtich
    ]
})


  const temp_progress = Create_circularprogress({ icon:"", value:temp.bind(), color: "PaleGreen"})
  const ram_progress = Create_circularprogress({icon:"", value: ram.bind()})
  const cpu_progress = Create_circularprogress({icon:"󰻠", value: cpu.bind()})
  // const disk_progress = Create_circularprogress({icon:"󰋊", value: disk.bind()})

  temp_progress.on("notify::value", self => {
    if(self.value <= 0.53){
      self.child.label = `<span font="Symbols Nerd Font Regular 22" color="PaleGreen"></span>`
      self.css = 'min-width: 80px;'  // its size is min(min-height, min-width)
            + 'min-height: 80px;'
            + 'font-size: 8px;' // to set its thickness set font-size on it
            + 'margin: 5px;' // you can set margin on it
            + 'background-color: @theme_base_color;' // set its bg color
            + `color: PaleGreen;` // set its fg color
    } else if(self.value > 0.53 && self.value <= 0.59){
      self.child.label = `<span font="Symbols Nerd Font Regular 22" color="Moccasin"></span>`
      self.css = 'min-width: 80px;'  // its size is min(min-height, min-width)
            + 'min-height: 80px;'
            + 'font-size: 8px;' // to set its thickness set font-size on it
            + 'margin: 5px;' // you can set margin on it
            + 'background-color: @theme_base_color;' // set its bg color
            + `color: Moccasin;` // set its fg color
    } else {
      self.child.label = `<span font="Symbols Nerd Font Regular 22" color="lightsalmon"></span>`
      self.css = 'min-width: 80px;'  // its size is min(min-height, min-width)
            + 'min-height: 80px;'
            + 'font-size: 8px;' // to set its thickness set font-size on it
            + 'margin: 5px;' // you can set margin on it
            + 'background-color: @theme_base_color;' // set its bg color
            + `color: lightsalmon;` // set its fg color
    }
  })

  // const grid = new Gtk.Grid({
  //   margin: 4,
  //   halign: 3,
  //   // row_spacing: 1,
  //   // column_spacing: 1,
  // })
  // grid.attach( Widget.Box( {class_name: "circularprogress"},cpu_progress,),10,10,100,100)
  // grid.attach( Widget.Box( {class_name: "circularprogress"},ram_progress,),115,10,100,100)
  // grid.attach( Widget.Box( {class_name: "circularprogress"},temp_progress,),10,115,100,100)
  // grid.attach( Widget.Box( {class_name: "circularprogress"},disk_progress,),115,115,100,100)
  const grid = Widget.Box(
    {
      class_name: "sensor_box",
    },
    Widget.Box( {class_name: "circularprogress"},temp_progress,),
    Widget.Box( {class_name: "circularprogress"},cpu_progress,),
    Widget.Box( {class_name: "circularprogress"},ram_progress,),
    // Widget.Box( {class_name: "circularprogress"},disk_progress,),
  )
//}}}
  
//{{{ Sliders
  const sliders = Widget.Box({
    class_name: "sliders",
    vertical: true,
    homogeneous: false,
    children:[
      Create_slider({
        icon: Utils.watch(get_volume_icon(),audio.speaker,get_volume_icon),
        max: 150,
        value: audio.speaker.bind("volume").as(v => v * 100) || 0,
        onChange: ({value}) => audio.speaker.volume = value / 100
      }),
      Create_slider({
        icon:Utils.watch(get_brightness_icon(),brightness,get_brightness_icon),
        value: brightness.bind("screen_value").as(v => v * 100),
        onChange: ({value}) => brightness.screen_value = value / 100,
      }),
      Create_slider({
        icon: Utils.watch(get_mic_icon(),audio.microphone, get_mic_icon),
        value: audio.microphone.bind("volume").as( v => v * 100) || 0,
        onChange: ({value}) =>{
          audio.microphone.volume = value / 100}
      })
    ]
  })
//}}}

  const dashboardBox = Widget.Scrollable({
    hscroll: "never",
    vexpand: true,

    child: Widget.Box({
    vpack: "end",
    hexpand: true,
    class_name: "dashboard",
    vertical: true,
    children: [buttons_list, sliders, mediaModule.MediaWidget(), grid, weatherModule.realtimeWidget, cryptoModule.cryptoWidget ].reverse()
    })
  })

  const stackBox = Widget.Stack({
    class_name: "dashboard_stackbox",
    children: {
      "dashboard": dashboardBox,
      "notifications": notificationModule.NotificationWidget(),
    },
  })

  const dashboardWindow = Widget.Window({
    name: "dashboard_window",
    class_name: "dashboard_window",
    margins: [5, 5, 0, 5],
    // exclusivity: 'exclusive',
    visible: false,
    anchor: ["right","top","bottom"],
    child: Widget.Box(
      {
      },
      weatherModule.forecastWidget,
      Widget.Box(
        {
          vertical: true,
          class_name: "dashboard_box",
          // hexpand: true,
          children: [
            controls,
            stackBox,
          ].reverse()
        },
      )
    )
  })
  stackBox.shown = "dashboard"

    const dashboardButton = Widget.ToggleButton({
      class_name: "dashboard_button",
      on_toggled: () => { 
      App.ToggleWindow("dashboard_window")
      if( dashboardWindow.visible == true){
        cpu.startPoll()
        ram.startPoll()
        // disk.startPoll()
        temp.startPoll()
      } else if(dashboardWindow.visible == false) {
        cpu.stopPoll()
        ram.stopPoll()
        // disk.stopPoll()
        temp.stopPoll()
      }
    },
      child: Widget.Label({
        use_markup: true,
        // label: `<span font="Symbols Nerd Font Regular 16">󰕮</span>`
        // label: `<span font="Symbols Nerd Font Regular 16"></span>`
        label: `<span font="Symbols Nerd Font Regular 16">󰡃</span>`
      })
    })

    return {
      window: dashboardWindow,
      button: dashboardButton,
    }
  }
