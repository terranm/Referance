import { Vector3,Time, Quaternion, Resources, Animator, RuntimeAnimatorController, Avatar} from 'UnityEngine';
import { Room } from 'ZEPETO.Multiplay'
import { Player,vector3 } from 'ZEPETO.Multiplay.Schema';
import { ZepetoScriptBehaviour,ZepetoScriptableObject } from 'ZEPETO.Script'
import DataSc from './DataSc';

export default class OtherPlayerCtrl extends ZepetoScriptBehaviour {
    public room:Room;
    public player:Player;
    private isRide:boolean;
    private data:ZepetoScriptableObject<DataSc>;
    private anim:Animator;

    Start() {    
        this.data = Resources.Load("ScriptableObject") as ZepetoScriptableObject;
        this.anim = this.transform.parent.gameObject.AddComponent<Animator>();
        this.anim.runtimeAnimatorController = this.data["anim"] as RuntimeAnimatorController;
        this.anim.avatar = this.data["avatar"] as Avatar;
        this.anim.enabled = false;
    }
    //고정 시간(0.25 간격으로 호출)
    FixedUpdate(){
        if(this.player != null && !this.player.isRide){
            //플레이어가 탑승상태가 아니면 
            //애니메이션 끔
            this.anim.enabled = false;
            this.anim.SetBool("isFlying", false);
            return;
        } 
        else if(this.player.isRide){
            //플레이어가 탑승중이면
            //비행 애니메이션으로 변경 후 위치 및 회전값 변경
            this.anim.enabled = true;
            this.anim.SetBool("isFlying", true);
            let position = this.ParseVector3(this.player.transform.position);
            let rotation = Quaternion.Euler(this.ParseVector3(this.player.transform.rotation));
            this.transform.parent.transform.position = Vector3.Lerp(this.transform.parent.transform.position, position, Time.deltaTime * 10);
            this.transform.parent.transform.rotation = Quaternion.Slerp(this.transform.parent.transform.rotation, rotation, Time.deltaTime * 10);
        }
        
    }
    //schemas의 vector3값을 UnityEngine Vector3로 변경
    private ParseVector3(vector3: vector3): Vector3 {
        return new Vector3
        (
            vector3.x,
            vector3.y,
            vector3.z
        );
    }

}