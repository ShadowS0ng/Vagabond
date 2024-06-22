const cryptoService = await import("./cryptoService.js")

const cryptoCurrency = cryptoService.default

cryptoCurrency.url = `Enter your coinmarketcap api url here`

const list = [ 1, 1027, 4943, 825, 5994, 74 ]
const iconsDir = App.configDir + "/assets/crypto_icons/"
const icons = {
  1: "bitcoin.svg",
  1027: "ethereum.svg",
  4943: "dai.png",
  825: "tether.svg",
  5994: "shiba_inu.png",
  74: "doge.svg",
}

const unfilteredList = cryptoCurrency.bind("list")
function formatNumber(number) {
  return Math.abs(number) >= 1.0e+9
  ? ( Math.abs(number) / 1.0e+9 ).toFixed(2) + "B"
  : ( Math.abs(number) >= 1.0e+6 )
  ? ( Math.abs(number) / 1.0e+6 ).toFixed(2) + "M"
  : ( Math.abs(number) >= 1.0e+3 )
  ? ( Math.abs(number) / 1.0e+3 ).toFixed(2) + "K"
  : ( Math.abs(number)).toFixed(2)
}


function createCryptoBox(symbolID) {
    const button = Widget.ToggleButton({
        on_toggled: () => { details.reveal_child = ! details.reveal_child},
        child: Widget.Box(
            {
            },
            Widget.Icon({
              icon: `${iconsDir}` + icons[symbolID],
              size: 24,
            }),
            Widget.Label({
            hpack: "start",
            justification: "left",
            label: unfilteredList.as( uList => uList.data.find( ({id}) => id === symbolID ).symbol )
          }),
          Widget.Label({
            class_name: "percent_change_1h",
            justification: "left",
            use_markup: true,
            label: unfilteredList.as( uList => { 
              const percent_change_1h = uList.data.find( ({id}) => id === symbolID ).quote.USD.percent_change_1h
              const [integer, fraction] = uList.data.find( ({id}) => id === symbolID ).quote.USD.percent_change_1h.toString().split(".");
              if(percent_change_1h > 0){
                return `<span color="MediumSeaGreen" >${integer}.${fraction.match(/0*[1-9]{2}/)}<span font="kalam Bold 8">%</span></span>`
              }
              
              return `<span color="LightCoral" >${integer}.${fraction.match(/0*[1-9]{2}/)}<span font="kalam Bold 8">%</span></span>`
            } ),
          })
        )
      })
    const price = Widget.Label({
      class_name: "price",
      // hpack: "start",
      use_markup: true,
      justification: "left",
      label: unfilteredList.as( uList => { 
      const percent_change_1h = uList.data.find( ({id}) => id === symbolID ).quote.USD.percent_change_1h
      const [integer, fraction] = uList.data.find( ({id}) => id === symbolID ).quote.USD.price.toString().split(".");
      // if(percent_change_1h > 0)
        return `<span color="#86BB65">${integer}.${fraction.match(/0*[1-9]{4}/)}<span font="kalam Bold 8">USD</span></span>`

      // return `<span color="LightCoral"><span font="kalam Bold 12">$ </span>${integer}.${fraction.match(/0*[1-9]{4}/)}</span>`
    } )
    })

    const percent_change_24h = Widget.Box(
      {
        class_name: "percent_change_24h",
      },
      Widget.Label({
        hpack: "start",
        hexpand: true,
        use_markup: true,
        justification: "left",
        label: "24h:"
      }),
      Widget.Label({
        use_markup: true,
        justification: "left",
        label: unfilteredList.as( uList => { 
        const percent_change_24h = uList.data.find( ({id}) => id === symbolID ).quote.USD.percent_change_24h
        const [integer, fraction] = percent_change_24h.toString().split(".");
        if(percent_change_24h > 0)
          return `<span color="MediumSeaGreen">${integer}.${fraction.match(/0*[1-9]{2}/)}<span font="kalam Bold 8">%</span></span>`

        return `<span color="LightCoral">${integer}.${fraction.match(/0*[1-9]{2}/)}<span font="kalam Bold 8">%</span></span>`
      } )
      })
    )

    const volume = Widget.Box(
      {
        class_name: "volume",
      },
      Widget.Label({
        hpack: "start",
        hexpand: true,
        use_markup: true,
        justification: "left",
        label: "VOL:"
      }),
      Widget.Label({
        use_markup: true,
        justification: "left",
        label: unfilteredList.as( uList => { 
        const volume_24h = uList.data.find( ({id}) => id === symbolID ).quote.USD.volume_24h
        const volume_change_24h = uList.data.find( ({id}) => id === symbolID ).quote.USD.volume_change_24h
        // const [volInteger, volFraction] = volume_24h.toString().split(".");
        const [changeInteger, changeFraction] = volume_change_24h.toString().split(".");
        if(volume_change_24h > 0)
          return `<span color="DarkTurquoise">${formatNumber(volume_24h)}</span> <span color="MediumSeaGreen">${changeInteger}.${changeFraction.match(/0*[1-9]{2}/)}<span font="kalam Bold 8">%</span></span>`

          return `${formatNumber(volume_24h)} <span color="LightCoral">${changeInteger}.${changeFraction.match(/0*[1-9]{2}/)}<span font="kalam Bold 8">%</span></span>`
      } )
      })
    )
    const percent_change_7d = Widget.Box(
      {
        class_name: "percent_change_7d",
      },
      Widget.Label({
        hpack: "start",
        hexpand: true,
        use_markup: true,
        justification: "left",
        label: "7d:"
      }),
      Widget.Label({
        use_markup: true,
        justification: "left",
        label: unfilteredList.as( uList => { 
        const percent_change_7d = uList.data.find( ({id}) => id === symbolID ).quote.USD.percent_change_7d
        const [integer, fraction] = percent_change_7d.toString().split(".");
        if(percent_change_7d > 0)
          return `<span color="MediumSeaGreen">${integer}.${fraction.match(/0*[1-9]{2}/)}<span font="kalam Bold 8">%</span></span>`

        return `<span color="LightCoral">${integer}.${fraction.match(/0*[1-9]{2}/)}<span font="kalam Bold 8">%</span></span>`
      } )
      })
    ) 

    const percent_change_30d = Widget.Box(
      {
        class_name: "percent_change_30d",
      },
      Widget.Label({
        hpack: "start",
        hexpand: true,
        use_markup: true,
        justification: "left",
        label: "30d: "
      }),
      Widget.Label({
        use_markup: true,
        justification: "left",
        label: unfilteredList.as( uList => { 
        const percent_change_30d = uList.data.find( ({id}) => id === symbolID ).quote.USD.percent_change_30d
        const [integer, fraction] = percent_change_30d.toString().split(".");
        if(percent_change_30d > 0)
          return `<span color="MediumSeaGreen">${integer}.${fraction.match(/0*[1-9]{2}/)}<span font="kalam Bold 8">%</span></span>`

        return `<span color="LightCoral">${integer}.${fraction.match(/0*[1-9]{2}/)}<span font="kalam Bold 8">%</span></span>`
      } )
      })
    )

    const details = Widget.Revealer({
      revealChild: false,
      transition_duration: 500,
      transition: "slide_down",
      child: Widget.Box(
        {
          vertical: true,
          class_name: "details"
        },
        price,
        percent_change_24h,
        volume,
        percent_change_7d,
        percent_change_30d,
      )
    })
    return Widget.Box(
      {
        class_name: "symbol",
        vertical: true,
      },
      button,
      details,
    )
}

/** @param {String} time*/
function convertTime(time){
  const date = new Date(time)
  const [,localTime, dayTime] = date.toLocaleTimeString().match(/(\d*:\d*):\d*\ (\D*)/) || ""

  return `${date.toLocaleDateString().replaceAll("/",".")} ${localTime} ${dayTime}`
}

function createLastUpdated(symbolID){
  const timeLabel = Widget.Label({
    class_name: "last_updated",
    hpack: "start",
    hexpand: true,
    use_markup: true,
    justification: "left",
    label: unfilteredList.as( uList => { 
    const last_updated = uList.data.find( ({id}) => id === symbolID ).quote.USD.last_updated
    return `<span font="kalam Bold 10">Updated: ${convertTime(last_updated)}</span>`
  } )
  })
  return timeLabel
}

/** @param { import("types/widgets/box.js").Box } box */
function createCryptoWidget(box){
  if(cryptoCurrency.list !== null && cryptoWidget.children.length === 1){
    const boxLeft = Widget.Box(
      {
        class_name: "symbolbox_left",
        vertical: true,
      },
    )
    const boxRight = Widget.Box(
      {
        class_name: "symbolbox_right",
        vertical: true,
      },
    )
    for(let index in list){
      if( parseInt(index) < list.length / 2){
        boxLeft.children = [...boxLeft.children, createCryptoBox(list[index])]
      } else if( parseInt(index) >= list.length / 2 ) {
        boxRight.children = [...boxRight.children, createCryptoBox(list[index])]
      }
    }
    box.children = [...box.children,
      Widget.Box(
        {
          // hexpand: true,
          homogeneous: true,
        },
        boxLeft,
        boxRight,
      )
    ]

    box.children[0].children = [createLastUpdated(list[0]), ...box.children[0].children]
  }
}

const spinner = Widget.Spinner()

export const cryptoWidget = Widget.Box(
  {
    class_name: "crypto_widget",
    vertical: true,
  },
  Widget.Box(
    {
      hexpand: true,
        // hpack: "start",
    },
    spinner,
    Widget.Button(
      {
        hpack: "end",
        on_primary_click: ()=> { 
          spinner.start()
          cryptoCurrency.updateList().then( ()=> {
            spinner.stop()
            createCryptoWidget(cryptoWidget)
          }).catch( ()=> spinner.stop() )
        },
        label: "",
      }
    )
  ),
)
spinner.stop()

cryptoCurrency.updateList().then( ()=> createCryptoWidget(cryptoWidget))
