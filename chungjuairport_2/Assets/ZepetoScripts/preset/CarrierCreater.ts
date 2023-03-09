import { GameObject, Time, Vector3 } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class CarrierCreater extends ZepetoScriptBehaviour {
    public carrier : GameObject;

    private cnt : number;
    private carrierNum : number;
    private carrierList;
    Start() {    
        this.carrier
        this.carrierList = []
        for(let i = 0; i < 10; i++){
            let Obj = GameObject.Instantiate(this.carrier) as GameObject;
            Obj.name = i.toString();
            Obj.transform.localPosition = Vector3.zero;
            Obj.transform.SetParent(this.gameObject.transform);
            this.carrierList.Add(Obj);
            Obj.SetActive(false);
        }
    }
    FixedUpdate(){
        this.cnt += Time.deltaTime;
        if(this.cnt > 3){
            let Obj = this.carrierList[this.carrierNum++] as GameObject;
            Obj.SetActive(true);
        }
    }
    
    public CarrierDestory(carNum : string){
        let num = parseInt(carNum);
        let Obj = this.carrierList[num] as GameObject;
        Obj.transform.localPosition = Vector3.zero;
        Obj.SetActive(false);
    }
}