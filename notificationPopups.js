const notifications = await Service.import("notifications");

/** @param {import('resource:///com/github/Aylur/ags/service/notifications.js').Notification} n */
function NotificationIcon({app_icon, app_entry, image}) {
  if(image) {
    return Widget.Box({
      css: `background-image: url('${image}');`
          + "background-size: contain;"
          + "background-repeat: no-repeat;"
          + "min-width: 256px;"
          + "min-height: 144px;"
          + "background-position: center;",
    })
  }
  
  let icon = "notification-symbolic"
  if(Utils.lookUpIcon(app_icon))
      icon = app_icon

  if(app_entry && Utils.lookUpIcon(app_entry))
      icon = app_entry

  return Widget.Box({
    child: Widget.Icon({
      icon: icon,
    }),
  })
}

/** @param {import('types/service/notifications').Notification} n */
function ScreenshotPopup(n) {
  const icon = Widget.Box({
    // vpack: "center",
    hpack: "center",
    class_name: "icon",
    child: NotificationIcon(n)
  })
  
  const title = Widget.Label({
    class_name: "screenshot-title",
    use_markup: true,
    // max_width_chars: 24,
    justification: "center",
    hpack: "center",
    vpack: "end",
    // wrap: true,
    // hexpand: true,
    // xalign: 0,
    label: n.summary,
  })

  const app_name = Widget.Label({
    class_name: "screenshot-app_name",
    use_markup: true,
    // wrap: true,
    justification: "center",
    hpack: "center",
    vpack: "end",
    // xalign: 0,
    max_width_chars: -1,
    truncate: "end",
    // hexpand: false,
    // vexpand: true,
    label: n.app_name,
  })

  const body = Widget.Label({
    class_name: "screenshot-body",
    use_markup: true,
    wrap: true,
    justification: "center",
    hpack: "center",
    vpack: "center",
    max_width_chars: -1,
    // xalign: 0,
    // hexpand: true,
    label: n.body,
  })

  const actions = Widget.Box({
    class_name: "actions",
    vertical: false,
    // spacing: 10,
    children: n.actions.map( ({ id, label }) => Widget.Button({
      class_name: "action-button",
      hexpand: true,
      on_clicked: () => { 
        n.invoke(id);
        n.dismiss();
      },
      setup: self => {
        if(n.hints && n.hints["action-icons"] && Object.keys(n.hints["action-icons"]).length !== 0){
          self.child = Widget.Box([
            Widget.Icon({
              icon: n.hints["action-icons"][id]
            }),
            Widget.Label(label)
          ])
        } else {
          self.child = Widget.Label(label)
        }
      }
    }))
  })

 return Widget.EventBox(
    {
    attribute: { id: n.id },
    on_primary_click: () => n.dismiss(),
    },
    Widget.Box(
        {
        visible: true,
        class_name: `popup ${n.urgency}`,
        vertical: true,
        },
        app_name,
        title,
        body,
        icon,
        actions
    )
  )
}

/** @param {import('types/service/notifications').Notification} n */
function ScreenshotNotification(n) {
  const icon = Widget.Box({
    hpack: "center",
    class_name: "icon",
    child: NotificationIcon(n)
  })
  
  const title = Widget.Label({
    class_name: "screenshot-title",
    use_markup: true,
    justification: "center",
    hpack: "center",
    vpack: "end",
    // wrap: true,
    // hexpand: true,
    label: n.summary,
  })

  // const app_name = Widget.Label({
  //   class_name: "screenshot-app_name",
  //   use_markup: true,
  //   wrap: true,
  //   justification: "center",
  //   hpack: "center",
  //   max_width_chars: 20,
  //   truncate: "end",
  //   hexpand: false,
  //   label: n.app_name,
  // })

  const body = Widget.Label({
    class_name: "screenshot-body",
    use_markup: true,
    wrap: true,
    max_width_chars: -1,
    justification: "center",
    hpack: "center",
    vpack: "center",
    // xalign: 0,
    // hexpand: true,
    label: n.body,
  })

  const time_match = new Date(n.time * 1000).toLocaleTimeString().match(/(\d{0,2}:\d{0,2})\:\d{0,2}\ (\D*)/);
  const time_formatted = time_match !== null ? time_match[1] + " " + time_match[2] : "";
  const time = Widget.Label({
    class_name: "time",
    use_markup: true,
    justification: "center",
    hpack: "start",
    vpack: "start",
    // xalign: 0,
    hexpand: true,
    label: time_formatted,
  });

  const close = Widget.Button(
    {
    class_name: "close",
    hexpand: false,
    hpack: "end",
    vpack: "start",
    on_primary_click: () => { 
        n.dismiss()
        n.close() 
      },
    },
    Widget.Icon({
      icon: "window-close-symbolic",
      size: 16,
    })
    // Widget.Label({
    //   use_markup: true,
    //   label: "󱎘",
    //   justification: "center",
    //   hexpand: false,
    //   hpack:"center",
    // })
  )

  const actions = Widget.Box({
    class_name: "actions",
    vertical: false,
    children: n.actions.map( ({ id, label }) => Widget.Button({
      class_name: "action-button",
      hexpand: true,
      on_clicked: () => { 
        n.invoke(id);
        n.dismiss();
      },
      setup: self => {
        if(n.hints && n.hints["action-icons"] && Object.keys(n.hints["action-icons"]).length !== 0){
          self.child = Widget.Box([
            Widget.Icon({
              icon: n.hints["action-icons"][id]
            }),
            Widget.Label(label)
          ])
        } else {
          self.child = Widget.Label(label)
        }
      }
    }))
  })

  return Widget.Box(
        {
        attribute: { id: n.id },
        class_name: `notification ${n.urgency}`,
        vertical: true,
        },
        // Widget.Box([
        //   Widget.Box(
        //   {
        //     vertical: true,
        //   },
        //   app_name,
        // ),
          Widget.CenterBox({
            vertical: false,
            hexpand: true,
            start_widget: time,
            center_widget: title,
            end_widget: close,
          }),
          body,
          icon,
        // ]),
        actions
    )
}

/** @param {import('types/service/notifications').Notification} n */
function Popup(n){
  const icon = Widget.Box({
    // vpack: "center",
    hpack: "center",
    class_name: "icon",
    child: NotificationIcon(n)
  })
  
  const app_name = Widget.Label({
    class_name: "app_name",
    use_markup: true,
    wrap: true,
    hpack: "center",
    // xalign: 0,
    max_width_chars: -1,
    justification: "left",
    hexpand: false,
    // vexpand: true,
    label: n.app_name,
  })

  const title = Widget.Label({
    class_name: "title",
    use_markup: true,
    // max_width_chars: 24,
    justification: "left",
    wrap: true,
    hpack: "start",
    vpack: "end",
    hexpand: true,
    vexpand: true,
    // xalign: 0,
    label: n.summary,
  })

  const body = Widget.Label({
    class_name: "body",
    use_markup: true,
    wrap: true,
    xalign: 0,
    justification: "left",
    max_width_chars: -1,
    hpack: "start",
    vpack: "start",
    hexpand: true,
    vexpand: true,
    label: n.body,
  })

  const actions = Widget.Box({
    class_name: "actions",
    vertical: false,
    // spacing: 10,
    children: n.actions.map( ({ id, label }) => Widget.Button({
      class_name: "action-button",
      hexpand: true,
      on_clicked: () => { 
        n.invoke(id);
        n.dismiss();
      },
      setup: self => {
        if(n.hints && n.hints["action-icons"] && Object.keys(n.hints["action-icons"]).length !== 0){
          self.child = Widget.Box([
            Widget.Icon({
              icon: n.hints["action-icons"][id]
            }),
            Widget.Label(label)
          ])
        } else {
          self.child = Widget.Label(label)
        }
      }
    }))
  })

  return Widget.EventBox(
    {
    attribute: { id: n.id },
    on_primary_click: () => n.dismiss(),
    },
    Widget.Box(
        {
        visible: true,
        class_name: `popup ${n.urgency}`,
        vertical: true,
        },
        Widget.Box([
          Widget.Box(
          {
            vertical: true,
          },
          icon,
          app_name,
          // time,
        ),
        Widget.Separator(
          {
            vertical: true,
          }
        ),
          Widget.Box(
          {
            class_name: "bodybox",
            vertical: true,
          },
          title,
          body,
        )
        ]),
        actions
    )
  )
}

/** @param {import('types/service/notifications').Notification} n */
function Notification(n){
  const icon = Widget.Box({
    // vpack: "center",
    hpack: "center",
    class_name: "icon",
    child: NotificationIcon(n)
  })
  
  const app_name = Widget.Label({
    class_name: "app_name",
    use_markup: true,
    wrap: true,
    hpack: "center",
    // xalign: 0,
    justification: "left",
    max_width_chars: -1,
    hexpand: false,
    // vexpand: true,
    label: n.app_name,
  })

  const title = Widget.Label({
    class_name: "title",
    use_markup: true,
    max_width_chars: -1,
    justification: "left",
    wrap: true,
    hexpand: true,
    vexpand: true,
    hpack: "start",
    vpack: "end",
    // xalign: 0,
    label: n.summary,
  })

  const body = Widget.Label({
    class_name: "body",
    use_markup: true,
    wrap: true,
    xalign: 0,
    justification: "left",
    hpack: "baseline",
    max_width_chars: -1,
    vpack: "start",
    vexpand: true,
    hexpand: true,
    label: n.body,
  })

  const time_match = new Date(n.time * 1000).toLocaleTimeString().match(/(\d{0,2}:\d{0,2})\:\d{0,2}\ (\D*)/);
  const time_formatted = time_match !== null ? time_match[1] + " " + time_match[2] : "";
  const time = Widget.Label({
    class_name: "time",
    use_markup: true,
    justification: "center",
    hpack: "start",
    vpack: "start",
    // xalign: 0,
    hexpand: false,
    label: time_formatted,
  });

  const actions = Widget.Box({
    class_name: "actions",
    vertical: false,
    // spacing: 10,
    children: n.actions.map( ({ id, label }) => Widget.Button({
      class_name: "action-button",
      hexpand: true,
      on_clicked: () => { 
        n.invoke(id);
        n.dismiss();
      },
      setup: self => {
        if(n.hints && n.hints["action-icons"] && Object.keys(n.hints["action-icons"]).length !== 0){
          self.child = Widget.Box([
            Widget.Icon({
              icon: n.hints["action-icons"][id]
            }),
            Widget.Label(label)
          ])
        } else {
          self.child = Widget.Label(label)
        }
      }
    }))
  })

  const close = Widget.Button(
    {
    class_name: "close",
    hexpand: false,
    vexpand: false,
    hpack: "end",
    vpack: "start",
    on_primary_click: () => { 
        n.dismiss()
        n.close() 
      },
    },
    Widget.Icon({
      icon: "window-close-symbolic",
      size: 16,
    })
    )

    return Widget.Box(
    {
      attribute: { id: n.id },
      class_name: `notification ${n.urgency}`,
      vertical: true,
      vexpand: false,
    },
    Widget.Box(
      {
      // vertical: true,
      },
      Widget.Box(
      {
        vertical: true,
      },
      time,
      icon,
      app_name,
      ),
      Widget.Separator({vertical: true,}),
      Widget.Box(
      {
        class_name: "bodybox",
        vertical: true,
        // vexpand: true,
      },
      title,
      body
      ),
      close,
    ),
    actions
  )
  }


export function NotificationPopups(monitor = 0) {

 let popup_list = Widget.Box({
    // margin: 8,
    vertical: true,
    children: notifications.popups.map(n => Popup(n))
  })

  function onNotified( _,/** @type {number} */id ) {
    const n = notifications.getNotification(id)
    
    // if(n?.image && n.image !== "" )
    if(n?.image)
      return popup_list.children = [ScreenshotPopup(n), ...popup_list.children]

    if(n){ 
      popup_list.children = [Popup(n), ...popup_list.children]
    }
  }

  function onDismissed(_,/** @type {number} */id) {
    popup_list.children.find(n => n.attribute.id === id)?.destroy();
    const n = notifications.getNotification(id)
    if( n && n.urgency === "low")
      n.close()
  }

  
  popup_list.hook(notifications, (_, id) => { if( !notifications.dnd ) onNotified(_, id) }, "notified")
            .hook(notifications,onDismissed, "dismissed");


  return Widget.Window({
      monitor,
      name: `notif-popups${monitor}`,
      class_name: "notification-popups",
      anchor:["top"],
      // visible: false,
      child: Widget.Box({
      class_name: "notifpopups",
      css: `min-width: 2px; min-height: 2px;`,
      vertical: true,
      children: [popup_list, Widget.Label("")],
    }),
  })
}

notifications.clearDelay = 500

/** @param {import('types/service/notifications').Notification} n */
async function delayedDismiss(n, i){
  Utils.timeout(notifications.clearDelay * i, () => { 
  n.dismiss()
  n.close()
  })
}

export function NotificationWidget() {

  const notifications_list = Widget.Box({
    vexpand: true,
    vpack: "end",
    class_name: "notification_list",
    vertical: true,
    children: notifications.notifications.map( n => n.image ? ScreenshotNotification(n) : Notification(n) ),
  })
  
  function onNotified( _,/** @type {number} */id ) {
    const n = notifications.getNotification(id)
      
    if(n?.image)
      return notifications_list.children = [ScreenshotNotification(n), ...notifications_list.children]

    if(n && n.urgency !== "low")
      notifications_list.children = [Notification(n), ...notifications_list.children]
  }

  function onClosed(_,/** @type {number} */ id){
    notifications_list.children.find(n => n.attribute.id === id)?.destroy();
  }

  const buttons = Widget.Box(
    {
      class_name: "notification_widget_buttons",
      vertical: false,
      vexpand: false,
      homogeneous: true,
    },
    Widget.ToggleButton(
        {
          hexpand: true,
          on_toggled: () => { 
            notifications.dnd = ! notifications.dnd;
          },
        label: "DND",
        }
     ),
    Widget.Button(
        {
          hexpand: true,
          on_primary_click: () => { 
            notifications.Clear()
            notifications.popups.forEach( (n, i) => { 
                delayedDismiss(n, i)
            })
          },
        label: "Dismiss All",
        }
     ),

  )

  notifications_list.hook(notifications,onNotified, "notified")
                    .hook(notifications,onClosed, "closed");

  const box = Widget.Box(
    {
      vertical: true,
      children: [
        buttons,
        Widget.Scrollable({
          class_name: "notifications_window",
          hexpand: false,
          vexpand: true,
          vscroll: "always",
          hscroll: "never",
          child: notifications_list,
        }),
      ].reverse()
    }
  )

  return box
}
