const mpris = await Service.import("mpris");
mpris.cacheCoverArt = false

const FALLBACK_ICON = "audio-x-generic-symbolic"
const PLAY_ICON = "media-playback-start-symbolic"
const PAUSE_ICON = "media-playback-pause-symbolic"
const STOP_ICON = "media-playback-stop-symbolic"
const PREV_ICON = "media-skip-backward-symbolic"
const NEXT_ICON = "media-skip-forward-symbolic"

/** @param { import("types/service/mpris").MprisPlayer } player */
function createPlayer(player) {

 const coverArt =  Widget.Box({
    vertical: true,
  }).hook(player, (self) => {
      self.css = `background-image: url('${player.track_cover_url === "" ? App.configDir + "/assets/MediaWidget/fallback.png" : player.track_cover_url }');
         background-size: contain;
         background-position: center;
         min-width: 295px;
         min-height: 165px;
         opacity: 0.6;
         background-repeat: no-repeat;`
    },"changed")

  const appIcon = Widget.Icon({
    class_name: "media_icon",
    icon: player.bind("name").transform( name => Utils.lookUpIcon(name) ? name : FALLBACK_ICON ),
    size: 28,
    hpack: "end",
    vpack: "start",
  })

  const positionVar = Variable(player.position,{
    poll:[1000, () => player.position ]
  })

  player.connect("closed", () => { 
    positionVar.dispose() 
  })

  const progressBar = Widget.ProgressBar({
    vpack: "end",
    value: positionVar.bind("value").transform( v => (v / player.length) )
  })//.hook(player, () => {
  //   player.play_back_status !== "Playing" ? positionVar.startPoll() : positionVar.stopPoll()
  // }, "changed")

  const previousBtn = Widget.Button({
    class_name: "previous_btn",
    on_primary_click: () => { 
      if(player.can_go_prev)
        player.previous()
    },
    vexpand: true,
    hexpand: true,
    // visible: player.bind("can_go_prev"),
    child: Widget.Icon({
      icon: player.bind("can_go_prev").as( can_go_prev => can_go_prev ? PREV_ICON : "" ),
      // icon: PREV_ICON,
      size: 36
    })
  })

  const playPauseBtn = Widget.Button({
    class_name: "playpause_btn",
    on_primary_click: () => { player.playPause() },
    vexpand: true,
    hexpand: true,
    child: Widget.Icon({
      icon: player.bind("play_back_status").as( status => {
        switch (status) {
          case "Paused":
            return PAUSE_ICON
          case "Playing":
            return PLAY_ICON
          case "Stopped":
            return STOP_ICON
        }
      } )
    })
  })

  const nextBtn = Widget.Button({
    class_name: "next_btn",
    on_primary_click: () => { 
      if(player.can_go_next)
        player.next()
    },
    vexpand: true,
    hexpand: true,
    // visible: player.bind("can_go_next").as( can_go_next => can_go_next),
    child: Widget.Icon({
      icon: player.bind("can_go_next").as( can_go_next => can_go_next ? NEXT_ICON : "" ),
      // icon: NEXT_ICON,
      size: 36
    })
  })
  const trackArtists = Widget.Revealer({
      class_name: "track_artists",
      transition: "slide_left",
      transition_duration: 7000,
      reveal_child: true,

      child: Widget.Label({
        label: player.bind("track_artists").as( v => v.join(", "))
      }),
  })

  const trackAlbum = Widget.Label({
    className: "track_album",
    label: player.bind("track_album").as( v => v ),
  }).hook(player, (self)=> {
      player.track_album === "" ? self.visible = false : self.visible = true
    }, "changed")

  const trackTitle = Widget.Revealer({
    className: "track_title",
    transition: "slide_right",
    transition_duration: 7000,
    reveal_child: true,

    child: Widget.Label({
      label: player.bind("track_title").as( v => v)
    }),
  })

const overlay = Widget.Overlay(
  {
    attribute: player.bus_name,
    child: coverArt,
    overlays: [
        Widget.Box(
          {
            vertical: true,
            // vexpand: true,
            vpack: "end",
            // hpack: "center"
          },
          trackArtists,
          trackAlbum,
          trackTitle,
        ),
        progressBar,
        appIcon,
        Widget.Box(
          {
            hexpand: true,
            vexpand: true,
          },
          previousBtn,
          playPauseBtn,
          nextBtn,
        )
    ]
  },
)
  return Widget.EventBox({
    class_name: "player",
    child: overlay,
    on_hover: () => {
      previousBtn.visible = true;
      playPauseBtn.visible = true;
      nextBtn.visible = true;
      trackArtists.reveal_child = ! trackArtists.reveal_child
      trackTitle.reveal_child = ! trackTitle.reveal_child
    },
    on_hover_lost: () => {
      previousBtn.visible = false;
      playPauseBtn.visible = false;
      nextBtn.visible = false;
      trackArtists.reveal_child = ! trackArtists.reveal_child
      trackTitle.reveal_child = ! trackTitle.reveal_child
    }
  })
}

export function MediaWidget() {
  return Widget.Box(
    {
      class_name: "mediawidget",
      vexpand: false,
      spacing: 5,
      vertical: true,
      children: mpris.bind("players").as( players => players.reverse().map( player => createPlayer(player) )),
      visible: mpris.bind("players").as( players => players.length > 0 ),
    }
  )
}
