import { Collider, Color, Debug, Input, LayerMask, Mathf, Physics, RaycastHit, Vector3, WaitForSeconds } from 'UnityEngine'
import { ZepetoPlayers } from 'ZEPETO.Character.Controller'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';

export default class CamRay extends ZepetoScriptBehaviour {

    layerMask = 1 << LayerMask.NameToLayer("Button");
    Start() {    
        this.layerMask = 1 << LayerMask.NameToLayer("Button");
    }

    Update(){
        if(Input.GetMouseButtonDown(0)){
            let ray = ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera.ScreenPointToRay(Input.mousePosition);
            let ref = $ref<RaycastHit>();    

            if(Physics.Raycast(ray, ref,Mathf.Infinity, this.layerMask))
            {
                
                // RaycatHit 데이터를 확인하기 위해, $unref 연산자로 다시 unwrapping 하는 부분에 유의해주세요.
                let hitInfo = $unref(ref);  
                if(hitInfo.collider.tag == "Contect"){
                    hitInfo.collider.gameObject.SetActive(false);
                }

                if(hitInfo.collider.tag == "CF")
                {
                    GameManager.UI.ShowUI(hitInfo.collider.name);
                }
                else if(hitInfo.collider.name != "5" && hitInfo.collider.name != "11" && hitInfo.collider.name != "17" && hitInfo.collider.name != "CarBtn")
                {
                    GameManager.UI.ShowUI(hitInfo.collider.name, 1);
                }
                    
                if(hitInfo.collider.name == "3")
                {
                    GameManager.GetInstance.HoldSomething("Lemon");
                    this.StartCoroutine(this.Delay("4"));
                }
                else if(hitInfo.collider.name == "5"){
                    //
                    GameManager.GetInstance.HoldSomething("PetLemon");
                }
                else if(hitInfo.collider.name == "9"){
                    GameManager.GetInstance.HoldSomething("Kiwi");
                    this.StartCoroutine(this.Delay("10"));
                }
                else if(hitInfo.collider.name == "11"){
                    //
                    GameManager.GetInstance.HoldSomething("PetKiwi");
                }
                else if(hitInfo.collider.name == "15"){
                    GameManager.GetInstance.HoldSomething("Orange");
                    this.StartCoroutine(this.Delay("16"));
                }
                else if(hitInfo.collider.name == "17"){
                    //
                    GameManager.GetInstance.HoldSomething("PetOrange");
                }

                if(hitInfo.collider.name == "CarBtn"){
                    console.log("?");
                    if(GameManager.GetInstance.car == null)
                    console.log("?");
                        GameManager.GetInstance.RideCar();
                }
            } 
        }
    }

    OnTriggerEnter(col:Collider){
        if(col.gameObject.tag == "Player"){
            let layerMask = (1 << LayerMask.NameToLayer("Player"));  // Everything에서 Player 레이어만 제외하고 충돌 체크함
            layerMask  = ~layerMask ;
            ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera.cullingMask = layerMask;
        }
    }

    OnTriggerExit(col: Collider) {
        if(col.gameObject.tag == "Player"){
            let layerMask = (1 << LayerMask.NameToLayer("Everything"));  
            layerMask  = ~layerMask ;
            ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera.cullingMask = layerMask;
        }
    }

    *Delay(num:string){
        yield new WaitForSeconds(1);
        GameManager.UI.ShowUI(num, 1);
    }

}