import test from 'node:test';
import assert from 'node:assert/strict';
import {createLeadHandler} from '../api/save-lead.js';
test('SpriteForge: explicit opt-in, private save before success, studio notification', async()=>{
    for(const name of ['BLOB_READ_WRITE_TOKEN','GMAIL_USER','GMAIL_APP_PASSWORD'])process.env[name]='local-test';
    const records=[],notices=[];
    const submit=createLeadHandler(async(path,body,options)=>records.push({lead:JSON.parse(body),options}),async lead=>notices.push(lead));
    const req={method:'POST',headers:{origin:'https://www.lockdownstudios.com','content-type':'application/json'},body:{enquiryType:'spriteforge',name:'Demo',email:'test@example.invalid'}};
    const res={setHeader(){},status(n){this.code=n;return this},json(data){this.data=data;}};
    await submit(req,res);assert.equal(res.code,400);assert.equal(records.length,0);
    req.body.launchConsent=true;await submit(req,res);
    assert.equal(res.code,201);assert.equal(records[0].options.access,'private');assert.equal(records[0].lead.source,'spriteforge_preorder');
    assert.equal(records[0].lead.consentVersion,'spriteforge-launch-v1');assert.equal(notices.length,1);
});
