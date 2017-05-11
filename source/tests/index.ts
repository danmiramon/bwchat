import * as superagent from "superagent";
import expect = require("expect.js");

const baseUrl = 'http://localhost:3000/';
let id: string;

describe("Express REST API Test", function(){
    //Test the USERS database
    it("POST", function(done){
        superagent.post(baseUrl + 'test')
        .send({username: 'daniel',
                email: 'dan@gmail.com'})
        .end(function(err, res){
            expect(err).to.eql(null);
            expect(res.body.ops.length).to.eql(1);
            expect(res.body.ops[0]._id.length).to.eql(24);
            id = res.body.ops[0]._id;
        });
    });

    it('GET document', function(done){
        superagent.get(baseUrl + 'test/' + id)
            .end(function(err, res){
                expect(err).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body._id.length).to.eql(24);
                expect(res.body._id).to.eql(id);
                done();
            });
    });

    it('GET collection', function(done){
        superagent.get(baseUrl + 'test')
            .end(function(err, res){
                expect(err).to.eql(null);
                expect(res.body.length).to.be.above(0);
                expect(res.body.map(function(item:any){
                    return item._id;
                })).to.contain(id);
                done();
            });
    });

    it('UPDATE', function(done){
        superagent.put(baseUrl + 'test/' + id)
            .send({username: 'danio',
                email: 'miramontes@gmail.com'})
            .end(function(err,res){
                expect(err).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.msg).to.eql('success');
                done();
            });
    });

    it('Check Updated Object', function(done){
        superagent.get(baseUrl + 'test/' + id)
            .end(function(err, res){
                expect(err).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body._id.length).to.eql(24);
                expect(res.body.username).to.eql('danio');
                done();
            });
    });

    it('DELETE', function(done){
        superagent.delete(baseUrl + 'test/' + id)
            .end(function(err, res){
                expect(err).to.eql(null);
                expect(typeof res.body).to.eql('object');
                expect(res.body.msg).to.eql('success');
                done();
            });
    });
});


describe("Authentication Strategies", function(){
    it("Facebool", function(done){});

    it("Google", function(done){});

    it("Local", function(done){});
});


describe("Profile Tests", function(){
    it("Select profile picture", function(done){});

    it("Upload image", function(done){});

    it("Change username", function(done){});

    it("Username already exists", function(done){});

    it("Correct e-mail format", function(done){});

    it("Incorrect e-mail format", function(done){});

    it("Language changed", function(done){});
});