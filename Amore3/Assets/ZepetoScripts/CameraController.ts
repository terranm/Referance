import { Animator, Camera, CapsuleCollider, CharacterController, Color, Debug, GameObject, Input, LayerMask, Mathf, Physics, PrimitiveType, Quaternion, RaycastHit, Resources, Time, Transform, Vector3, WaitForSeconds } from 'UnityEngine';
import { UnityEvent } from 'UnityEngine.Events';
import { Button } from 'UnityEngine.UI';
import { CharacterState, UIZepetoPlayerControl, ZepetoPlayer, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { Room, RoomData } from 'ZEPETO.Multiplay';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import SitPos from './SitPos';
export default class CameraController extends ZepetoScriptBehaviour {

    private camera: Camera;
    public multiplay: ZepetoWorldMultiplay;

    layerMask_Button: number = 1 << LayerMask.NameToLayer("Button");
    layerMask_Player: number;
    layerMask_Wall: number;
    layerMask_Glass: number;
    public isSit: boolean;

    getLip: boolean = false;
    hasLipMark: boolean = false;

    private player: GameObject;
    fireWork: GameObject;
    lipObj: GameObject;
    moveLipObj: GameObject;
    nullObj: GameObject;
    lipMarkObj: GameObject;
    _clickEff:GameObject;
    clickEff:GameObject;
    _lipEff:GameObject;
    lipEff:GameObject;


    public npc: Animator;
    anim: Animator;
    sitPos: Vector3;
    charCon: CharacterController;
    capCol: CapsuleCollider;

    hadPos: Transform;
    lipStartPos: Transform;
    lipMarkPos: Transform;
    headPos: Transform;
    


    Start()
    {
        this.multiplay = GameObject.Find("WorldMultiplay").GetComponent<ZepetoWorldMultiplay>();
        this.camera = this.gameObject.GetComponent<Camera>();
        this.layerMask_Glass = 1 << LayerMask.NameToLayer("Glass");
        this.layerMask_Button = 1 << LayerMask.NameToLayer("Button");
        this.layerMask_Wall = 1 << LayerMask.NameToLayer("Wall");
        this.layerMask_Player = 1 << LayerMask.NameToLayer("Player");
        this.StartCoroutine(this.FindCharacter());
        this.lipObj = Resources.Load("Lip") as GameObject;
        this.moveLipObj = Resources.Load("MoveLip") as GameObject;
        this.lipStartPos = GameObject.Find("FirstPos").transform
        this.lipMarkObj = Resources.Load("LipMark") as GameObject;
        this._clickEff = Resources.Load("Dust") as GameObject;
        this._lipEff = Resources.Load("Eff") as GameObject;
        this.StartCoroutine(this.Update());
    }

    *Update()
    {
        while (true)
        {
            if (this.multiplay.Room != null && this.multiplay.Room.IsConnected)
            {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.multiplay.Room.SessionId);
                if (hasPlayer)
                {
                    this.UIRay();
                    this.Sensing();
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.multiplay.Room.SessionId);
                    if (myPlayer.character.CurrentState != CharacterState.Idle)
                    {
                        if (!this.charCon.enabled)
                        {
                            this.charCon.enabled = true;
                            this.capCol.enabled = false;
                            this.isSit = false;
                            this.anim.SetBool("Sit", false);
                            this.anim.SetBool("Sit2", false);
                            this.multiplay.Room.Send("Sit", this.isSit);
                            this.multiplay.Room.Send("Sit2", this.isSit);
                        }
                    }
                }
            }
            yield null;
        }
    }

    UIRay()
    {
        if (Input.GetMouseButtonDown(0))
        {
            var hit = $ref<RaycastHit>();
            var ray = this.camera.ScreenPointToRay(Input.mousePosition);

            if ((Physics.Raycast(ray.origin, ray.direction, hit, Mathf.Infinity, this.layerMask_Button)))
            {
                let _hit = hit.value;
                if (_hit.collider.gameObject.name == "Click")
                {
                    this.npc.SetTrigger("MakeUp");
                }
                else if (_hit.collider.gameObject.tag == "Sitbutton")
                {
                    let sitPos = _hit.collider.gameObject.GetComponent<SitPos>();
                    this.StartCoroutine(this.SendCharacter(sitPos.sitPos));
                    this.charCon.enabled = false;
                    this.capCol.enabled = true;
                    this.isSit = true;
                    this.Sit(1);
                }
                else if (_hit.collider.gameObject.name == "Lipbutton" && this.getLip == false)
                {
                    this.StartCoroutine(this.Lip());
                    this.getLip = true;
                    this.anim.SetBool("Get", true);
                }
                else if (_hit.collider.gameObject.name == "LipMovebutton" && this.getLip)
                {
                    this.getLip = false;
                    this.anim.SetBool("Get", false);
                    GameObject.Destroy(this.nullObj);
                    this.StartCoroutine(this.LipMove());
                }
                else if (_hit.collider.gameObject.name == "LipMarkbutton" && !this.hasLipMark)
                {
                    let lipMark = GameObject.Instantiate(this.lipMarkObj, this.lipMarkPos) as GameObject;
                    lipMark.transform.localPosition = new Vector3(0.0596, 0.0284, 0.0767);
                    lipMark.transform.localRotation = Quaternion.Euler(19.265, 62.854, -4.84);
                    this.hasLipMark = true;
                }
                else if (_hit.collider.gameObject.name == "Sitbutton2")
                {
                    let sitPos = _hit.collider.gameObject.GetComponent<SitPos>();
                    this.StartCoroutine(this.SendCharacter(sitPos.sitPos));
                    this.charCon.enabled = false;
                    this.capCol.enabled = true;
                    this.isSit = true;
                    this.Sit(2);
                }
                else if (_hit.collider.gameObject.name == "Photobutton")
                {
                    let sitPos = _hit.collider.gameObject.GetComponent<SitPos>();
                    this.StartCoroutine(this.SendCharacter(sitPos.sitPos));
                }
            }
        }
    }

    Sensing()
    {
        if (this.player != null)
        {
            var hit = $ref<RaycastHit>();
            let dir = (this.headPos.transform.position - this.transform.position).normalized

            if (Physics.Raycast(this.transform.position, dir, hit, Mathf.Infinity, this.layerMask_Player))
            {
                let _hit = hit.value;
                let dist = _hit.distance;
                if (dist < 0.3)
                {
                    this.camera.cullingMask = ~this.layerMask_Player;

                }
                else
                {
                    this.camera.cullingMask = -1;
                }
            }

            Debug.DrawRay(this.transform.position, dir * 10, Color.red);


        }
    }

    Sit(number: number)
    {
        if(number == 1){
            this.anim.SetBool("Sit", this.isSit);
            this.multiplay.Room.Send("Sit", this.isSit);
        }
        else{
            this.anim.SetBool("Sit2", this.isSit);
            this.multiplay.Room.Send("Sit2", this.isSit);
        }
    }

    *Lip()
    {
        this.nullObj = GameObject.Instantiate(this.lipObj) as GameObject;
        this.nullObj.transform.parent = this.hadPos;
        this.nullObj.transform.localPosition = new Vector3(-0.3731, 0.2377, -0.2142);
        this.nullObj.transform.localRotation = Quaternion.Euler(137.328, 125.037, -33.771);

        if(this.clickEff == null){
            this.clickEff = GameObject.Instantiate(this._clickEff) as GameObject;
            this.clickEff.transform.parent = this.hadPos;
            this.clickEff.transform.position = this.hadPos.position;
            this.clickEff.SetActive(true);
            this.clickEff.transform.LookAt(this.transform);
            yield new WaitForSeconds(1);
            this.clickEff.SetActive(false);
        }
        else{
            this.clickEff.SetActive(true);
            this.clickEff.transform.LookAt(this.transform);
            yield new WaitForSeconds(1);
            this.clickEff.SetActive(false);
        }

        
        
        
        /*let newCube = GameObject.CreatePrimitive(PrimitiveType.Cube);
        newCube.transform.parent = this.hadPos;
        newCube.transform.localPosition = Vector3.zero;*/
    }

    *LipMove()
    {
        let lip = GameObject.Instantiate(this.moveLipObj) as GameObject;
        lip.transform.position = new Vector3(-7.397, 1.151, 13.907);
        lip.transform.rotation = Quaternion.Euler(0, 180, 0);
       
        if(this.lipEff == null){
            this.lipEff = GameObject.Instantiate(this._clickEff) as GameObject;
            this.lipEff.transform.localScale = new Vector3(2,2,2);
            this.lipEff.transform.position = new Vector3(-5.45, 1.488, 13.782);
            let dir = Quaternion.LookRotation(this.transform.position - this.lipEff.transform.position).normalized;
            dir.x = 0;
            dir.z = 0;
            this.lipEff.transform.rotation = Quaternion.Slerp(this.transform.rotation, dir, 5 * Time.deltaTime);;
            this.lipEff.SetActive(false);
            this.lipEff.SetActive(true);
            yield new WaitForSeconds(1);
            this.lipEff.SetActive(false);
        }
        else{
            this.lipEff.SetActive(true);
            let dir = Quaternion.LookRotation(this.transform.position - this.lipEff.transform.position).normalized;
            dir.x = 0;
            dir.z = 0;
            this.lipEff.transform.rotation = Quaternion.Slerp(this.transform.rotation, dir, 5 * Time.deltaTime);;
            yield new WaitForSeconds(1);
            this.lipEff.SetActive(false);
        }
        
        
        this.StartCoroutine(this.DestroyLip(lip));
    }
   

    *DestroyLip(obj: GameObject)
    {
        yield new WaitForSeconds(30);
        GameObject.Destroy(obj);

    }

    *FindCharacter()
    {
        while (true)
        {
            if (this.multiplay.Room != null && this.multiplay.Room.IsConnected)
            {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.multiplay.Room.SessionId);
                if (hasPlayer)
                {
                    this.player = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.gameObject;
                    this.charCon = this.player.GetComponent<CharacterController>();
                    this.anim = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator;
                    this.hadPos = this.player.transform.GetChild(0).GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(3).GetChild(1).GetChild(1).GetChild(0).GetChild(1).GetChild(0).GetChild(0);
                    this.lipMarkPos = this.player.transform.GetChild(0).GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(1).GetChild(0);
                    let _headPos = this.player.GetComponentsInChildren<Transform>();
                    for (let i = 0; i < _headPos.Length; i++)
                    {
                        if (_headPos[i].gameObject.name == "head")
                        {
                            this.headPos = _headPos[i];
                        }
                    }
                    yield new WaitForSeconds(0.5);
                    this.capCol = this.player.GetComponent<CapsuleCollider>();
                    return;
                }
            }
            yield null;
        }
    }

    
    private SendTransform(transform: Transform)
    {
        const data = new RoomData();

        const pos = new RoomData();
        pos.Add("x", transform.localPosition.x);
        pos.Add("y", transform.localPosition.y);
        pos.Add("z", transform.localPosition.z);
        data.Add("position", pos.GetObject());

        const rot = new RoomData();
        rot.Add("x", transform.localEulerAngles.x);
        rot.Add("y", transform.localEulerAngles.y);
        rot.Add("z", transform.localEulerAngles.z);
        data.Add("rotation", rot.GetObject());
        this.multiplay.Room.Send("onChangedTransform", data.GetObject());
    }

    *SendCharacter(sitPos: Transform)
    {

        for (let i = 0; i < 6; i++)
        {
            this.player.transform.position = new Vector3(sitPos.transform.position.x, sitPos.transform.position.y, sitPos.transform.position.z);
            this.player.transform.rotation = sitPos.transform.rotation;
            yield new WaitForSeconds(0.001);
        }
        this.SendTransform(this.player.transform);
    }
}