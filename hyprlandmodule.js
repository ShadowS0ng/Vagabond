const hyprland = await Service.import("hyprland")

/** @param {import('types/service/hyprland').Client} task */
function getIcon(task) {
  if(Utils.lookUpIcon(task.class) === null)
    return task.initialClass
   
  return  task.class
}

/** @param {import('types/service/hyprland').Client} task */
function Task(task) {
  const icon =  Widget.Icon({
    icon: getIcon(task),
    size: 26,
  })

  const label = Widget.Label({
    class_name: "label",
    use_markup: true,
    justification: "left",
    truncate: "end",
    max_width_chars: 16,
    setup: (self) => {
      self.hook(hyprland , self => {
        const title = hyprland.clients.find( client => client.address === task.address)?.title
        if(title !== undefined)
        self.label = title
      })
    }
  })

  return Widget.Button(
    {
      class_name: hyprland.active.client.bind("address").as( v => v === task.address && "task_focused" || "task" ),
      vexpand: false,
      attribute: {
        address: task.address,
        workspace: task.workspace
      },
      // tooltipMarkup: `<b>${task.title.replaceAll("&","&amp;")}</b>`,
      tooltipMarkup: hyprland.bind("clients").as( clients => {
               let title =  clients.find( client => client.address === task.address )?.title || "" 
                return `<b>${title.replaceAll("&","&amp;")}</b>`
            } ) ,
      on_primary_click: () => hyprland.messageAsync(`dispatch focuswindow address:${task.address}`),
      setup: (self) => {
          self.hook(hyprland, (self) => {
            const ws = hyprland.clients.find( client => client.address === task.address )?.workspace
            if(ws !== undefined)
              self.attribute.workspace = ws
          })
      }
    },
    Widget.Box(
      {
        vexpand: false,
      },
      icon,
      label,
    )
  )
}

export function Tasklist() {
  const list = Widget.Box({
    className: "tasklist",
    vertical: false,
    homogeneous: true,
    children: hyprland.clients.sort( (a,b) => (a.workspace.id) - (b.workspace.id) ).map(Task)
  })

/** 
 * @param {import('types/service/hyprland').Client["address"]} address 
 */
  function onClientAdd(_, address) {
    const task = hyprland.getClient(address)
    if(task && task.title !== ""){
      list.add(Task(task))
      // list.children = [Task(task), ...list.children]
      list.show_all()
    }
  }

/** 
 * @param {import('types/service/hyprland').Client["address"]} address 
 */
  function onClientRemove(_, address){
    list.children.find(task => task.attribute.address === address)?.destroy()
  }

  list.hook(hyprland,onClientAdd,"client-added")
      .hook(hyprland,onClientRemove,"client-removed")
      .hook(hyprland, () => { list.children = list.children.sort( (a,b) => (a.attribute.workspace.id) - (b.attribute.workspace.id) )})
  
  return list
}

//Workspaces{{{
export function Workspaces() {
  let activeId = hyprland.active.workspace.bind("id")
  return Widget.Box({
    class_name: `workspaces`,
    homogeneous: false,
    vertical: false,
    spacing: 0,
    // children: Array.from({ length:6 },(_,i) => i + 1).map( (i) => Widget.Button({
    children:  ["一", "二", "三", "四", "五", "六"].map( (v,i) => {
      let ws_id = i + 1
      return Widget.Button({
        attribute: `${ws_id}`,
        label: v,
        // label: activeId.as( active => active != ws_id && `` || `󱥸` ),
        // class_name: activeId.as( active => active == i ? "focused" : hyprland.workspaces[i].windows != 0 ? "occupied" : "" ),
        on_clicked: () => { hyprland.messageAsync(`dispatch workspace ${ws_id}`) },
        setup: self => {
            self.hook(hyprland, self => {
              if(hyprland.active.workspace.id == ws_id){
                // self.label = `󰸵`;
                self.class_name = "focused";
              } else if(hyprland.active.workspace.id != ws_id){
                // self.label = `󰸶`;
                self.class_name = "";
                hyprland.workspaces.forEach( ws => {
                  if(ws.id == ws_id){
                    if(ws.windows != 0){
                      // self.label = "󰸸"; //󰸴
                      self.class_name = "occupied";
                    }
                  }
                });
                // self.class_name = "occupied"
                // self.toggleClassName("focused",false)
              } 
              // hyprland.active.workspace.id == i ? self.class_names = ["focused"] : self.class_names = []
              // hyprland.workspaces[i].windows == 0 ? 
            })
          }
      }) 
    }
    )
});
}
//}}}
