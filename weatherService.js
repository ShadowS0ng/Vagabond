class WeatherService extends Service {
  static {
    Service.register(
      this,
      //signals Object
      {
        "realtime-changed": ["jsobject"],
        "forecast-changed": ["jsobject"],
      },
      //properties Object
      {
        "realtime": ["jsobject", "rw"],
        "forecast": ["jsobject", "rw"],
      },
    );
  }

  #realtimeUrl = ``
  #forecastUrl = ``
  #home = Utils.HOME

  get realtime_url() {
    return this.#realtimeUrl
  }
  
  get forecast_url() {
    return this.#forecastUrl
  }

  set realtime_url(url){
    this.#realtimeUrl = url
  }

  set forecast_url(url) {
    this.#forecastUrl = url
  }

  async updateRealtime() {
      await Utils.execAsync(this.#realtimeUrl).then( (res) => {
        this.realtime = JSON.parse(res)
        Utils.writeFile(res, `${this.#home}/.cache/ags/realtime_cache`)
        this.emit("changed")
        this.emit("realtime-changed", this.realtime)
      }, 
        () => Utils.readFileAsync(`${this.#home}/.cache/ags/realtime_cache`).then( read => { 
          this.realtime = JSON.parse(read)
          this.emit("changed")
          this.emit("realtime-changed", this.realtime)
        } ) )
  }

  async updateForecast() {
     await Utils.execAsync(this.#forecastUrl).then( (res) => {
        this.forecast = JSON.parse( res )
        Utils.writeFile(res,`${this.#home}/.cache/ags/forecast_cache`) 
        this.emit("changed")
        this.emit("forecast-changed", this.forecast)
      }, () => Utils.readFileAsync(`${this.#home}/.cache/ags/forecast_cache`).then( read => {
        this.forecast = JSON.parse(read) 
        this.emit("changed")
        this.emit("forecast-changed", this.forecast)
      } ) )
  }

  constructor() {
    super();
  }
  
}

const service = new WeatherService

export default service
