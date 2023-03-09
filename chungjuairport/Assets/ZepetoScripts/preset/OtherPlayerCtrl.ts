import { Time, Quaternion, Resources, Animator, RuntimeAnimatorController, Avatar} from 'UnityEngine';
import * as UnityEngine from "UnityEngine";
import { Room } from 'ZEPETO.Multiplay'
import { Player,Vector3 } from 'ZEPETO.Multiplay.Schema';
import { ZepetoScriptBehaviour,ZepetoScriptableObject } from 'ZEPETO.Script'
import DataSc from './DataSc';
import Interaction from './Interaction';
import PlayerCtrl from './PlayerCtrl';

export default class OtherPlayerCtrl extends ZepetoScriptBehaviour {
    public room:Room;
    public player:Player;
    public data:ZepetoScriptableObject<DataSc>;
    public carPrefeb : UnityEngine.GameObject;
    
    private anim:Animator;
    private car : UnityEngine.GameObject;

    Start() {    
        //this.data = Resources.Load("ScriptableObject") as ZepetoScriptableObject;
        this.anim = this.transform.parent.gameObject.AddComponent<Animator>();
        this.anim.runtimeAnimatorController = this.data["anim"] as RuntimeAnimatorController;
        this.anim.avatar = this.data["avatar"] as Avatar;
        this.anim.enabled = false;
    }
    //고정 시간(0.25 간격으로 호출)
    FixedUpdate(){
        if (this.player == null) // 플레이어 없으면 무시
            return;
            
        if(!this.player.isRide){
            //플레이어가 탑승상태가 아니면 
            //애니메이션 끔
            this.anim.enabled = false;
            this.anim.SetBool("isDrive", false);
            return;
        } 
        else if(this.player.isRide){
            
            //플레이어가 탑승중이면
            //비행 애니메이션으로 변경 후 위치 및 회전값 변경
            this.anim.enabled = true;
            this.anim.SetBool("isDrive", true);
            let position = this.ParseVector3(this.player.transform.position);
            let rotation = Quaternion.Euler(this.ParseVector3(this.player.transform.rotation));
            this.transform.parent.transform.position = UnityEngine.Vector3.Lerp(this.transform.parent.transform.position, position, Time.deltaTime * 10);
            this.transform.parent.transform.rotation = Quaternion.Slerp(this.transform.parent.transform.rotation, rotation, Time.deltaTime * 10);
            //let car:UnityEngine.GameObject = (new Interaction()).CarCreate();
            //car.transform.SetParent(this.transform.parent);
            if (this.car == null){
                this.car = UnityEngine.GameObject.Instantiate<UnityEngine.GameObject>(this.carPrefeb);
                this.car.transform.SetPositionAndRotation(this.transform.parent.transform.position,this.transform.parent.transform.rotation);
                this.car.transform.Rotate(-90,0,0);
                this.car.transform.Translate(0.27, 0, -0.28);
                this.car.transform.SetParent(this.transform.parent);
            }
        }
        
    }

    //schemas의 vector3값을 UnityEngine Vector3로 변경
    private ParseVector3(vector3: Vector3): UnityEngine.Vector3 {
        return new UnityEngine.Vector3
        (
            vector3.x,
            vector3.y,
            vector3.z
        );
    }

}