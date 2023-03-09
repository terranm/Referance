import { GameObject,Camera,Vector3,CapsuleCollider, CharacterController, Collider } from 'UnityEngine';
import { UnityEvent$1 } from 'UnityEngine.Events';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class PlayerCtrl extends ZepetoScriptBehaviour {

    public capCol:CapsuleCollider;
    private charCol:CharacterController;
    public event:UnityEvent$1<int>;
    
    public isRide:boolean = false;

    Start() {    
        this.event = new UnityEvent$1<int>();
       
        this.StartCoroutine(this.Init());
    }
    

     //차량 탑승 물리 충돌
     OnTriggerEnter(other:Collider){
        //제트팩일 시 
        console.log(other.gameObject.name);
        if(other.gameObject.name == "Car"){
            ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera.enabled = false;
            this.charCol.enabled = false;
            this.capCol.enabled = true;
        }
       
        //this.multiplay.Room.Send("Ride", this.isRide);
    }

    *Init(){
        while(true){
            yield null;
            console.log("Finding");
           if(this.transform.parent != null){
               this.charCol = this.transform.parent.GetComponent<CharacterController>();
               this.capCol = this.transform.parent.gameObject.AddComponent<CapsuleCollider>();
                this.capCol.center = new Vector3(0, 0.5, 0);
                this.capCol.radius = 0.25;
                this.capCol.height = 1.2;
                //ZepetoCharacter스크립트를 끄면 ZepetoAnimator에 접근할 수 없기때문에 따로 animator컴포넌트를 부착해 줘야 하고 동적으로 애니메이터컨트롤러와 아바타를 넣어줌
                // this.anim.runtimeAnimatorController = this.scriptable["anim"] as RuntimeAnimatorController;
                // this.anim.avatar = this.scriptable["avatar"] as Avatar;
                //this.anim.enabled = false;
                this.capCol.enabled = false;
               return;
           }
        }
    }

}