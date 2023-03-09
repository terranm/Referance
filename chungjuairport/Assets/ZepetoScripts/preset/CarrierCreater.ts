import { GameObject, LayerMask, Material, Quaternion, Renderer, Time, Vector3 } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';

export default class CarrierCreater extends ZepetoScriptBehaviour {
    public carrier : GameObject;
    public mat : Material[];

    private cnt : number;
    private carrierNum : number;
    private carrierList : GameObject[];

    Start() {    
        this.cnt = 50;
        this.carrierNum = 0;
        this.carrierList = new Array<GameObject>();
        for(let i = 0; i < 10; i++){
            this.carrierList[i] = this.CreateCarrier(this.carrier, i.toString(), this.mat[i%5]);
        }
        this.carrierList[this.carrierList.length] = this.CreateCarrier(this.carrier, "MyCarrier", this.mat[5]);

        // 버튼 생성
        let btn = GameManager.Resource.Instantiate("MyCarrierComponent");
        btn.transform.SetParent(this.carrierList[this.carrierList.length - 1].transform);
        btn.transform.position = this.gameObject.transform.position;
    }
    
    FixedUpdate(){
        this.cnt += Time.deltaTime;
        if(this.cnt > 3){
            //console.log("carrier" + this.carrierNum);
            let Obj = this.carrierList[this.carrierNum++] as GameObject;
            this.cnt = 0;
            if (this.carrierNum >= this.carrierList.length) this.carrierNum = 0;
            Obj.SetActive(true);
        }
    }

    private CreateCarrier(carrier : GameObject, name : string, mat : Material){
        let Obj = GameObject.Instantiate(carrier) as GameObject;
        Obj.name = name;
        Obj.transform.SetParent(this.gameObject.transform);
        Obj.transform.localPosition = Vector3.zero;
        Obj.transform.localRotation = Quaternion.identity;
        //Obj.transform.position = this.gameObject.transform.position;
        Obj.GetComponent<Renderer>().material = mat;//this.mat[i%5];
        Obj.SetActive(false);
        return Obj;
    }
    
    public CarrierDestory(carNum : string){
        let num = carNum != "MyCarrier" ? parseInt(carNum) : this.carrierList.length - 1;
        let Obj = this.carrierList[num] as GameObject;
        Obj.transform.localPosition = Vector3.zero;
        Obj.transform.localRotation = Quaternion.identity;
        Obj.SetActive(false);
    }
}