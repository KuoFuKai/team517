import {test} from 'node:test';
import assert from 'node:assert/strict';
import {trustSummary} from '../src/trust/projection';
import type {User} from '../src/domain/models';
test('Trust projection allowlists safe first name/status and never infers Auth or legal identity',()=>{
 const user={id:'helper-abcd',roles:['HELPER'],publicFirstName:'Alex',verificationStatus:'VERIFIED',email:'SECRET EMAIL',fullLegalName:'SECRET NAME',wallet:{availablePoints:999},verificationRecord:'SECRET PROVIDER'} as unknown as User;
 const dto=trustSummary(user,3,{reviewCount:2,averageRating:4.5});assert.deepEqual(dto,{userId:'helper-abcd',displayName:'Alex',verificationStatus:'VERIFIED',completedTaskCount:3,reviewCount:2,averageRating:4.5});assert.ok(!JSON.stringify(dto).includes('SECRET'));assert.ok(!JSON.stringify(dto).includes('wallet'));
 for(const name of ['Alex Secret Family','email@example.test','12345678'])assert.equal(trustSummary({...user,publicFirstName:name},0,{reviewCount:0}).displayName,'Helper ABCD');
});
test('Zero-review helpers do not receive an artificial zero-star rating or verification claim',()=>{const dto=trustSummary({id:'new-helper',roles:['HELPER']} as User,0,{reviewCount:0,averageRating:0});assert.equal(dto.averageRating,undefined);assert.equal(dto.verificationStatus,'UNVERIFIED');assert.equal(dto.completedTaskCount,0);});
