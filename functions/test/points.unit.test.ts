import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pointAmount,pointIdentity,projectPoints } from '../src/points/ledger';
const initial={availablePoints:1500,reservedPoints:0,lifetimeEarnedPoints:0,lifetimeSpentPoints:0};
test('Points integer validation rejects fractions, negatives, unsafe and oversized numbers',()=>{for(const n of [0,-1,1.1,NaN,Infinity,1_000_000_001,Number.MAX_SAFE_INTEGER])assert.throws(()=>pointAmount(n));assert.equal(pointAmount(250),250);});
test('Points identities are deterministic and unambiguous',()=>{assert.equal(pointIdentity('GRANT','a','b'),pointIdentity('GRANT','a','b'));assert.notEqual(pointIdentity('GRANT','a_b','c'),pointIdentity('GRANT','a','b_c'));});
test('Ledger projection conserves reserve/release and transfers without double-debiting available',()=>{const held=projectPoints(initial,'RESERVE',250);assert.equal(held.availablePoints,1250);assert.equal(held.reservedPoints,250);assert.deepEqual(projectPoints(held,'RELEASE',250),initial);const spent=projectPoints(held,'TRANSFER_OUT',250);assert.equal(spent.availablePoints,1250);assert.equal(spent.reservedPoints,0);assert.equal(spent.lifetimeSpentPoints,250);assert.throws(()=>projectPoints(initial,'RESERVE',2000));assert.throws(()=>projectPoints(initial,'TRANSFER_OUT',250));});
