import { GameObject, Transform, Vector3 } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class ObjAttach extends ZepetoScriptBehaviour {
    private obj : GameObject;
    // 물체 몸에 장착하기
    public ObjAttach(charTrans : Transform, obj : GameObject, translate : Vector3 = Vector3.zero){
        obj.transform.position = charTrans.position;
        obj.transform.Translate(translate);
        obj.transform.SetParent(charTrans);
        this.obj = obj;
    }

    public ObjDestory(){
        GameObject.Destroy(this.obj);
    }

}