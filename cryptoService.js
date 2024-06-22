class CryptoService extends Service{
  static{
    Service.register(
      this,
      //signals
      {
        "list-updated": ["jsobject"],
      },
      //properties object
      {
        "list": ["jsobject", "rw"]
      }
    );
  }

  #url = ""

  get url(){
    return this.#url
  }

  set url(url){
    this.#url = url
  }

  async updateList() {
    await Utils.execAsync(["bash", "-c", `${this.#url}`]).then( response => { 
      this.list = JSON.parse(response)
      this.emit("changed")
      this.emit("list-updated", JSON.parse(response))
    }
      , console.error )
  }

  constructor(){
    super();
    // this.list = JSON.parse(Utils.readFile("/home/mo/crypto.json"))
  }
}

const service = new CryptoService
export default service
