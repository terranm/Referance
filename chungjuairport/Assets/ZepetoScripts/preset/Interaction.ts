import { Canvas, AnimationClip, WaitForSeconds, GameObject, Object, Random, Vector3, Quaternion, Collider } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { ZepetoPlayers, ZepetoCharacter } from 'ZEPETO.Character.Controller';
import { Player } from 'ZEPETO.Multiplay.Schema';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import PlayerCtrl from './PlayerCtrl';

// import custom script from path
import UIController from './UIController';

export default class Interaction extends ZepetoScriptBehaviour 
{
    public openUIGesture: Button;
    public interactionCanvas: Canvas;
    public animationClip: AnimationClip;
    public rideEffectFactory: GameObject;
    public carPrefeb : GameObject
    
    private car : GameObject
    private zepetoCharacter :ZepetoCharacter;

    Start() 
    {    
        // Set EventCamera 
        this.interactionCanvas.worldCamera = ZepetoPlayers.instance.ZepetoCamera.camera;
        // Set character
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this.zepetoCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        });
        
        //Button Hide
        this.openUIGesture.gameObject.SetActive(false);
        
        //When Button Click
        this.openUIGesture.onClick.AddListener(()=>{
            this.StartCoroutine(this.CarRideCoroutine());
        });
    }
    
    OnTriggerEnter(collider:Collider)
    {
        if (collider.gameObject.tag == "Player" && !this.zepetoCharacter.gameObject.GetComponentInChildren<PlayerCtrl>().isRide){
            console.log(collider.gameObject.name + "OnTriggerEnter")
            this.openUIGesture.gameObject.SetActive(true);
        }
    }

    OnTriggerExit(collider:Collider)
    {
        if (collider.gameObject.tag == "Player"){
            console.log(collider.gameObject.name + "OnTriggerExit")
            this.openUIGesture.gameObject.SetActive(false);
        }
    }
    
    *CarRideCoroutine() 
    {
        //if (this.car == null){ 차량 이미 할당된 경우 재 할당 하지 않는 코드 고민 필요
        this.car = GameObject.Instantiate<GameObject>(this.carPrefeb);
        this.car.transform.SetPositionAndRotation(this.zepetoCharacter.transform.position,this.zepetoCharacter.transform.rotation);
        this.car.transform.Rotate(-90,0,0);
        this.car.transform.Translate(0.27, 0, -0.28);
        var obj = Object.Instantiate(this.rideEffectFactory) as GameObject;
        obj.transform.position = this.zepetoCharacter.transform.position;
        //} 
        this.zepetoCharacter.gameObject.GetComponentInChildren<PlayerCtrl>().CarRide(this.car.gameObject);
        //this.zepetoCharacter.transform.parent = this.car.transform;
        this.openUIGesture.gameObject.SetActive(false);
        
        //ZepetoPlayers.instance.ZepetoCamera.transform.position = new Vector3(this.zepetoCharacter.transform.position.x, this.zepetoCharacter.transform.position.y, this.zepetoCharacter.transform.position.z);
        //ZepetoPlayers.instance.ZepetoCamera.transform.Translate(5, 5, 0);
        //ZepetoPlayers.instance.ZepetoCamera.transform.LookAt(this.zepetoCharacter.transform.position);
        yield new WaitForSeconds(3);
        GameObject.Destroy(obj);
    }

    // private RandomCalculation()
    // {
    //     let randomNumber: number;
    //     randomNumber = Random.Range(0,100);
    //     if (randomNumber <= this.failureRatio)
    //     {
    //         this.Lose();
    //     }
    //     else
    //     {
    //         this.Win();
    //     }
    //     this.StartCoroutine(this.SecondRoutine());
    // }

    // private Lose()
    // {
    //     this.uiController.Lose();
    //     //GameObject Create
    //     var obj = Object.Instantiate(this.badEffectFactory) as GameObject;
    //     obj.transform.position = this.transform.position;
    // }

    // private Win()
    // {
    //     this.uiController.Win();
    //     //GameObject Create
    //     var obj = Object.Instantiate(this.goodEffectFactory) as GameObject;
    //     obj.transform.position = this.transform.position;
    //     var giftobj = Object.Instantiate(this.gift) as GameObject;
    //     giftobj.transform.position = this.transform.position;
    // }

    // *SecondRoutine()
    // {
    //     yield new WaitForSeconds(1);
    //     this.uiController.Init();
    //     //Destroy box
    //     GameObject.Destroy(this.gameObject);
    // }
}