class BrightnessService extends Service {
  //every subclass of Gobject.Object has to register itself 
  static {
    //takes three arguments 
    //the class itself 
    //an object defining the signals 
    //an object defining it's Properties
    Service.register(
      this,
      {
        // 'name-of-signal': [type as a string from GObject.TYPE_<type>],
        "screen-changed": ["float"],
      },
      {
        // 'kebab-cased-name': [type as a string from GObject.TYPE_<type>, 'r' | 'w' | 'rw']
        // 'r' means readable
        // 'w' means writable
        // guess what 'rw' means
        "screen-value": ["float","rw"],
      },
    );
  }

  // this Service assumes only one device with backlight
  #interface = Utils.exec("sh -c 'ls /sys/class/backlight/ | head -1'");

  // # prefix in JavaScript means private
  #screenValue = 0;
  #max = Number(Utils.exec("brightnessctl max"));

  // getters and setter have to be in snake_case
  get screen_value() {
    return this.#screenValue
  }

  set screen_value(percent){
    if(percent < 0){
      percent = 0;
    }
    if(percent > 1){
      percent = 1;
    }
    Utils.execAsync(`brightnessctl set ${percent * 100}% -q`)
     // the file monitor will handle the rest
  }

  constructor() {
    super()

    //setup monitor
    const brightness = `/sys/class/backlight/${this.#interface}/brightness`;
    Utils.monitorFile(brightness,() => this.#onChange());
    //initialize
    this.#onChange();
  }

  #onChange(){
    this.#screenValue = Number(Utils.exec(`brightnessctl get`)) / this.#max ; 
    
    //signals have to be explicitely emitted
    this.emit("changed");
    this.notify("screen-value");
    // or use Service.changed(propName: string) which does the above two
    // this.changed('screen-value');

    // emit screen-changed with percent as it's parameter
    this.emit("screen-changed",this.#screenValue)
  }

  connect(event = "screen-changed", callback){
    return super.connect(event, callback);
  }
}

// the singleton instance
const service = new BrightnessService;

// export to use in other modules
export default service;
