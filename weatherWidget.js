const weatherService = await import("./weatherService.js")
const weather = weatherService.default

weather.realtime_url = `Enter your tomorrow.io realtime api url here`
weather.forecast_url = `Enter your tomorrow.io forecast api url here`


const weatherCode = {
"0": "Unknown",
"1000": { description: "Clear, Sunny", iconDay: "clear_day", iconNight: "clear_night", },
"1100": { description: "Mostly Clear", iconDay: "mostly_clear_day", iconNight: "mostly_clear_night" },
"1101": { description: "Partly Cloudy", iconDay: "partly_cloudy_day", iconNight: "partly_cloudy_night" },
"1102": { description: "Mostly Cloudy", iconDay: "mostly_cloudy", iconNight: "mostly_cloudy" },
"1001": { description: "Cloudy", iconDay: "cloudy", iconNight: "cloudy" },
"2000": { description: "Fog", iconDay: "fog", iconNight: "fog" },   
"2100": { description: "Light Fog", iconDay: "fog_light", iconNight: "fog_light" },
"4000": { description: "Drizzle",  iconDay: "drizzle", iconNight: "drizzle" },
"4001": { description: "Rain", iconDay: "rain", iconNight: "rain" }, 
"4200": { description: "Light Rain", iconDay: "rain_light", iconNight: "rain_light" },
"4201": { description: "Heavy Rain", iconDay: "rain_heavy", iconNight: "rain_heavy" },
"5000": { description: "Snow", iconDay: "snow", iconNight: "snow" },
"5001": { description: "Flurries", iconDay: "flurries", iconNight: "flurries" },
"5100": { description: "Light Snow", iconDay: "snow_light", iconNight: "snow_light" },
"5101": { description: "Heavy Snow", iconDay: "snow_heavy", iconNight: "snow_heavy" },
"6000": { description: "Freezing Drizzle", iconDay: "freezing_drizzle", iconNight: "freezing_drizzle" },
"6001": { description: "Freezing Rain", iconDay: "freezing_rain", iconNight: "freezing_rain" },
"6200": { description: "Light Freezing Rain", iconDay: "freezing_rain_light", iconNight: "freezing_rain_light" },
"6201": { description: "Heavy Freezing Rain", iconDay: "freezing_rain_heavy", iconNight: "freezing_rain_heavy" },
"7000": { description: "Ice Pellets", iconDay: "ice_pellets", iconNight: "ice_pellets" },
"7101": { description: "Heavy Ice Pellets", iconDay: "ice_pellets_heavy", iconNight: "ice_pellets_heavy" },
"7102": { description: "Light Ice Pellets", iconDay: "ice_pellets_light", iconNight: "ice_pellets_light" },
"8000": { description: "Thunderstorm", iconDay: "tstorm", iconNight: "tstorm" },
}

const icons = {
  temperature: "",
  temperatureApparent: "feels like",
  humidity: "",
  // windSpeed: "",
  windSpeed: "",
  windDirection: "",
  pressureSurfaceLevel: "",
  visibility: "󰈈",
  // time: "",
  time: "󱑅",
  // time: "Updated:",
  location: "",
  uvIndex: "UV",
  max: "Max",
  min: "Min",
  sunset: "Sunset",
  sunrise: "Sunrise",
}

const units = {
  metric: {
    temperature: "󰔄",
    humidity: "%",
    windSpeed: "m/s",
    windGust: "m/s",
    windDirection: "",
    pressureSurfaceLevel: "hPa",
    freezingRainIntensity: "mm/hr",
    precipitationProbability: "%",
    visibility: "km",
    cloudCover: "%",
    cloudBase: "km",
    uvIndex: {
      3: "Low",
      6: "Moderate",
      8: "High",
      11: "Very High",
      12: "Extreme",
    }
  },

  imperial: {
    temperature: "󰔅",
    humidity: "%",
    windSpeed: "mph",
    windGust: "mph",
    windDirection: "",
    pressureSurfaceLevel: "inHg",
    freezingRainIntensity: "in/hr",
    precipitationProbability: "%",
    visibility: "mi",
    cloudCover: "%",
    cloudBase: "mi",
    uvIndex: {
      3: "Low",
      6: "Moderate",
      8: "High",
      11: "Very High",
      12: "Extreme",
    }
  }
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  function evalUV(uvIndex) {
    const index = uvIndex > 11 ? 12 : [3, 6, 8, 11].find( ts => uvIndex < ts)
    return units.metric.uvIndex[index]
  }

  //if you use "Symbols Nerd Font" you don't need to rise the units & values to align well with icons 
  function setUnit(unit, fontsize = 8, font = "kalam bold", rise = "0.0pt") {
      return `<span rise="${rise}" font="${font} ${fontsize}">${unit}</span>`
  }

  function setValue(value, fontsize = 10, font = "kalam bold", rise = "0.0pt") {
      return `<span rise="${rise}" font="${font} ${fontsize}">${value}</span>`
  }

  function setIcon(icon,color, fontsize = 14, font = "Symbols Nerd Font bold") {
    if(color)
      return `<span color="${color}" font="${font} ${fontsize}">${icon}</span>`

    return `<span font="${font} ${fontsize}">${icon}</span>`
  }

  function dayOrNight(time1, time2) {
    return time1 > time2 ? "iconNight" : "iconDay"
  }

  /** @param {String} utcDate */
  function convertDate(utcDate, out = "time" || "date" ) {
    const localeTime = new Date(utcDate)
    //filtering seconds
    const [,time, period] = localeTime.toLocaleTimeString().match(/(\d*:\d*):\d*\ (\D*)/) || "";
    const date = localeTime.toLocaleDateString().replaceAll("/", ".")
    const weekDay = localeTime.getDay()

    if(time && period && date){
      switch( out ) {
      case "time":
        return `${time} ${period}`
      case "date":
        return `${date}`
      case "weekday":
        return `${weekDays[weekDay]}`
      case "date&time":
        return `${date} ${time} ${period}`
      case "complete":
        return `${weekDays[weekDay]} ${date} ${time} ${period}`
      default:
        return `${time} ${period}`
    }

    }
  }

  let realtimeBind = weather.bind("realtime")
  const iconsDir = `${App.configDir}/assets/tomorrow-weather-codes/V1_icons/color`

/** @param { import("types/widgets/box.js").Box } box */
function RealtimeWidget(box) {
   const location = Widget.Label({
    class_name: "location",
    use_markup: true,
    justification: "left",
    hpack: "center",
    label: realtimeBind.as( data => { 
      if(data !== null){
        const [name,,b,] = data.location.name.split(",");
        return `${setIcon(icons.location,"IndianRed")} ${setValue(name+ "," + b,10,"kalam Bold", "1.0pt")}`
      }
      return ""
    })
  }) 

  const precipitation = Widget.Box(
    {
      class_name: "precipitation",
      hpack: "end",
      vpack: "start",
      hexpand: true,
    },
    Widget.Icon({
      icon: `${iconsDir}/precipitation.png`,
      size: 30,
    }),
    Widget.Label({
      use_markup: true,
      justification: "left",
      label: realtimeBind.as( data => data !== null ? `${setValue(data.data.values.precipitationProbability.toString(),14)}${setUnit(units.metric.precipitationProbability,12 )}` : "")
    })
  )
  
  const description = Widget.Box(
    {
      class_name: "description",
    },
    Widget.Icon({
    icon: realtimeBind.as( data => data !== null ? `${iconsDir}/${weatherCode[data.data.values["weatherCode"]][dayOrNight(data.data.time, weather.forecast.timelines.daily[0].values.sunsetTime)]}.svg` : "" ),
      size: 32,
    }),
    Widget.Separator({
      css: `margin-left: 4px;
            margin-right: 8px;`,
      vertical: true,
    }),
      Widget.Label({
        use_markup: true,
        css: `font-family: kalam;`,
        justification: "left",
        vpack: "end",
        label: realtimeBind.as( data => data !== null ? setValue(weatherCode[data.data.values["weatherCode"]].description,10) : "" )
      }),
      precipitation,
  )


  const temp = Widget.Label({
    class_name: "temperature",
    use_markup: true,
    hexpand: true,
    hpack: "start",
    justification: "left",
    label: realtimeBind.as( data => data !== null ? `\t\t\t\t${setValue(data.data.values.temperature.toString(), 18 )}${setUnit(units.metric.temperature,16 )}` : "")
  })

  const feels_like = Widget.Label({
    class_name: "feels_like",
    use_markup: true,
    hexpand: true,
    css: `margin-top: -4px;`,
    hpack: "center",
    justification: "right",
    label: realtimeBind.as( data => data !== null ? `\t\t\t${setIcon(icons.temperatureApparent, undefined, 11, "kalam regular")}: ${setValue(data.data.values.temperatureApparent.toString(), 13 )}${setUnit(units.metric.temperature,11 )}` : "")
  })

  const cloudCover = Widget.Label({
    class_name: "cloud_cover",
    use_markup: true,
    // hexpand: true,
    // hpack: "end",
    justification: "left",
    label: realtimeBind.as( data => data !== null ? `${setIcon(data.data.values.cloudCover.toString(), "DarkTurquoise", 12, "kalam bold")}${setIcon(units.metric.cloudCover, "DarkTurquoise", 10, "kalam bold")}  ${setValue(`of the sky is covered by cloads`,10)}` : "")
  })

  const humidity = Widget.Label({
    class_name: "humidity",
    use_markup: true,
    justification: "left",
    hpack: "start",
    hexpand: true,
    label: realtimeBind.as( data => data !== null ? `${setIcon(icons.humidity,"DarkTurquoise")} ${setValue(data.data.values.humidity.toString())}${setUnit(units.metric.humidity)}` : "")
  })

  const uv = Widget.Label({
    class_name: "uv",
    use_markup: true,
    justification: "left",
    // hexpand: true,
    hpack: "start",
    label: realtimeBind.as( data => data !== null ? `${setIcon(icons.uvIndex,"Indigo",14)} ${setValue(evalUV(data.data.values.uvIndex))}` : "" )
  })

  const pressure = Widget.Label({
    class_name: "pressure",
    use_markup: true,
    justification: "left",
    hexpand: true,
    hpack: "start",
    label: realtimeBind.as( data => data !== null ? `${setIcon(icons.pressureSurfaceLevel,"LightCoral")} ${setValue(data.data.values.pressureSurfaceLevel).toString()}${setUnit(units.metric.pressureSurfaceLevel)}` : "" )
  })

  const visibility = Widget.Label({
    class_name: "visibility",
    use_markup: true,
    justification: "left",
    // hexpand: true,
    hpack: "start",
    label: realtimeBind.as( data => data !== null ? `${setIcon(icons.visibility,"LightBlue")} ${setValue(data.data.values.visibility).toString()}${setUnit(units.metric.visibility)}` : "" )
  })

  const wind = Widget.Label({
    class_name: "wind",
    use_markup: true,
    justification: "left",
    // hexpand: true,
    hpack: "start",
    label: realtimeBind.as( data => data !== null ? `${setIcon(icons.windSpeed,"SpringGreen",14)} ${setValue(data.data.values.windSpeed.toString())}${setUnit(units.metric.windSpeed + ",")}\n\t ${setIcon(icons.windDirection,"Orange")} ${setValue(data.data.values.windDirection)}${setUnit(units.metric.windDirection + ",")}\n\t\t ${setValue('<span color="MediumSpringGreen">Gust: </span>' + data.data.values.windGust.toString())}${setUnit(units.metric.windGust)}` : "" )
  })



  const moreDetails = Widget.Revealer({
      class_name: "realtime_more_details",
      transition: "slide_down",
      transition_duration: 2000,
      reveal_child: false,
      child: Widget.Box(
        {
          vertical: true,
        },
        cloudCover,
        Widget.Box(
          {
          },
          humidity,
          uv,
        ),
        Widget.Box(
          {
          },
          pressure,
          visibility
        ),
        wind,
      )
    })


  // const realtimeWidget = Widget.Box(
  return box.children = [
    ...box.children,
      location,
    Widget.Box(
      {
      },
      Widget.Box(
        {
          class_name: "temperature_box",
          vertical: true,
        },
        description,
        temp,
        // Widget.Separator({ vertical: false, widthRequest: 5, }),
        feels_like,
      ),
    ),
    // cloudCover,
    moreDetails,
    Widget.Box(
      {
        hexpand: true,
      },
      Widget.ToggleButton({
        hexpand: false,
        vexpand: false,
        hpack: "start",
        vpack: "end",
        css: `font: bold 16px Symbols Nerd Font;
                    margin-left: -1px;
                    margin-right: 4px;
                    margin-bottom: -1px;`,
        on_toggled: () => { forecastWidget.reveal_child = !forecastWidget.reveal_child },
        label: "󰝡",
      }),
      Widget.ToggleButton({
        hexpand: false,
        vexpand: false,
        hpack: "start",
        vpack: "end",
        css: `font: bold 16px Symbols Nerd Font;
                    margin-left: -1px;
                    margin-bottom: -1px;`,
        on_toggled: () => { moreDetails.reveal_child = ! moreDetails.reveal_child },
        label: "󰕏",
      }),
      Widget.Box({
        hpack: "end",
        vpack: "end",
        hexpand: true,
        css: `background-image: url('${App.configDir}/assets/tomorrow-weather-codes/powered-by-tomorrow/Powered_by_Tomorrow-White.svg');
              background-size: contain;
              background-repeat: no-repeat;
              background-position: right;
              min-width: 120px;
              min-height: 20px;`,
      }),
    )
  ]
}

/** @param { import("types/widgets/box.js").Box } box */
function createRealtimeWidget(box){
  if(box.children.length === 1 && weather.realtime !== null){
    RealtimeWidget(box)
  }
}

const time = Widget.Label({
  class_name: "realtime_time",
  use_markup: true,
  justification: "left",
  hpack: "start",
  hexpand: true,
  label: realtimeBind.as( data => data !== null ? `${setIcon(icons.time)} ${setValue(convertDate(data.data.time, "date&time"),10)}` : "" )
})

const spinner = Widget.Spinner({
})

const update = Widget.Button({
  hexpand: false,
  vexpand: false,
  hpack: "end",
  vpack: "start",
  label: "",
  on_primary_click: () => {
    spinner.start()
    weather.updateRealtime().then( () => {
      createRealtimeWidget(realtimeWidget)
    } )
    weather.updateForecast().then( () => {
      spinner.stop()
      createForecast()
    }).catch( () => { spinner.stop() })
  },
})


export const realtimeWidget = Widget.Box(
  {
    vertical: true,
    class_name: "weather_box",
  },
  Widget.Box(
    {
    },
    time,
    spinner,
    update,
  ),
)
spinner.stop()

const forecastBind = weather.bind("forecast")

function tempMax(i) {
  return Widget.Label({
    use_markup: true,
    justification: "left",
    vpack: "end",
    label: forecastBind.as( forecast => `${setIcon(icons.max, "LightSalmon", 8, "kalam bold")} ${setValue(forecast.timelines.daily[i].values.temperatureMax)}${setUnit(units.metric.temperature)}` )
  })
}

function tempMin(i){
  return Widget.Label({
    use_markup: true,
    // hexpand: true,
    vpack: "end",
    justification: "left",
    label: forecastBind.as( forecast => `${setIcon(icons.min, "LightBlue", 8, "kalam bold")} ${setValue(forecast.timelines.daily[i].values.temperatureMin)}${setUnit(units.metric.temperature)}` )
  })
}

function date(i) {
  return Widget.Label({
    use_markup: true,
    justification: "left",
    label: forecastBind.as( forecast => `${setIcon("", "LightBlue", 12, "kalam bold")} ${setValue(convertDate(forecast.timelines.daily[i].time, "date"))}` )
  })
}

function weekday(i) {
  return Widget.Label({
    use_markup: true,
    justification: "left",
    label: forecastBind.as( forecast => `${setIcon("", "LightBlue", 12, "kalam bold")} ${setValue(convertDate(forecast.timelines.daily[i].time, "weekday"))}` )
  })
}

function descriptionMax(i) {
  return Widget.Box(
    {
    },
    Widget.Icon({
      icon: forecastBind.as( forecast => `${iconsDir}/${weatherCode[forecast.timelines.daily[i].values["weatherCodeMax"]].iconDay}.svg` ),
      size: 20,
    }),
  )
}

function descriptionMin(i) {
  return Widget.Box(
    {
    },
    Widget.Icon({
      icon: forecastBind.as( forecast => `${iconsDir}/${weatherCode[forecast.timelines.daily[i].values["weatherCodeMin"]].iconNight}.svg` ),
      size: 20,
    }),
  )
}

function precipitationAvg(i) {
  return Widget.Box(
    {
        hpack: "center",
        vpack: "start",
        hexpand: true,
    },
      Widget.Icon({
        icon: `${iconsDir}/precipitation.png`,
        size: 24,
        css: `margin-left: 4px;`,
      }),
      Widget.Label({
        use_markup: true,
        justification: "left",
        css: `margin-left: 4px;`,
        label: forecastBind.as( forecast => `${setValue(forecast.timelines.daily[i].values.precipitationProbabilityAvg.toString(),12)}${setUnit(units.metric.precipitationProbability,10 )}`)
      })
    )
}

function sunrise(i) {
  return Widget.Label({
    use_markup: true,
    justification: "left",
    // hexpand: true,
    hpack: "start",
    label: forecastBind.as( forecast => `${setIcon(icons.sunrise, "LightYellow", 8, "kalam bold")} ${setValue(convertDate(forecast.timelines.daily[i].values.sunriseTime, "time"))}` )
  })
}

function sunset(i) {
 return Widget.Label({
    use_markup: true,
    justification: "left",
    // hexpand: true,
    hpack: "start",
    label: forecastBind.as( forecast => `${setIcon(icons.sunset, "LightCoral", 8, "kalam bold")} ${setValue(convertDate(forecast.timelines.daily[i].values.sunsetTime, "time"))}` )
  })
}

async function forecast(i){
    return  Widget.Box(
      {
      },
      Widget.Separator({
        vertical: true,
        css: `margin-left: 0.4em;
              margin-right: 0.4em;`,
      }),
      Widget.Box(
        {
          vertical: true,
        },
        weekday(i),
        date(i),
        precipitationAvg(i),
        Widget.Box(
          {
            vertical: true,
          },
            Widget.Box(
            {
            },
            Widget.Box(
                {
                  vertical: true,
                },
                tempMax(i),
                tempMin(i),
            ),
              Widget.Separator({
                vertical: true,
                css: `margin-left: 0.4em;
                      margin-right: 0.4em;`
              }),
              Widget.Box(
                {
                  vertical: true,
                },
                descriptionMax(i),
                descriptionMin(i),
              ),
            ),
                sunrise(i),
                sunset(i),
          )
      ),
    ) 
  }

  const forecastBox = Widget.Box({
        vexpand: false,
        vpack: "center",
        hexpand: true,
        class_name: "forecast_box",
      })

async function createForecast() {
  if( weather.forecast !== null && forecastBox.children.length === 0)
    for(let i = 0; i < weather.forecast.timelines.daily.length; i++){
      if( i > 0 ) {
        // forecastBox.add(forecast(i))
        forecast(i).then( box => forecastBox.add(box) ).catch()
      } else {
        forecastBox.add(
          Widget.Box(
        {
        },
        Widget.Box(
          {
            vertical: true,
          },
          weekday(i),
          date(i),
          precipitationAvg(i),
          Widget.Box(
            {
              vertical: true,
            },
              Widget.Box(
              {
              },
              Widget.Box(
                  {
                    vertical: true,
                  },
                  tempMax(i),
                  tempMin(i),
              ),
                Widget.Separator({
                  vertical: true,
                  css: `margin-left: 0.4em;
                        margin-right: 0.4em;`
                }),
                Widget.Box(
                  {
                    vertical: true,
                  },
                  descriptionMax(i),
                  descriptionMin(i),
                ),
              ),
                  sunrise(i),
                  sunset(i),
            )
        ),
      )
        )
      }
    }
}
weather.updateRealtime().then( ()=> createRealtimeWidget(realtimeWidget) )
weather.updateForecast().then( ()=> createForecast())

  export const forecastWidget = Widget.Revealer({
    reveal_child: false,
    class_name: "forecast_reveal",
    transition: "slide_left",
    transition_duration: 2000,
    child: forecastBox
  })
