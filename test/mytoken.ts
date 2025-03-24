import {time,loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import {ethers} from "hardhat";

describe("Test mytoken",function(){
    //defiimport {expect} from "chai";
ne a fixture
    async function deployFixtrue() {
        const initialSupply = ethers.utils.parseEther("2000.0");
        const MyToken = await ethers.getContractFactory("MyToken");
        const mytoken =await MyToken.deploy(initialSupply);
        await mytoken.deployed();

        //account0 owner
        const [account0,account1,account2] = await ethers.getSigners();
        const address0 = account0.address;
        const address1 = account1.address;
        const address2 = account2.address;

        return {mytoken,account0,account1,account2,address0,address1,address2}
    }
    describe("Deployment",function(){
        it("test totalSupply...",async function(){
            const initialSupply = ethers.utils.parseEther("2000.0");
            const {mytoken,address0} = await loadFixture(deployFixtrue);
            expect(await mytoken.totalSupply()).to.equal(initialSupply)
            expect(await mytoken.balanceOf(address0)).to.equal(initialSupply)
        });
        it("test transfer",async function(){
            const {mytoken,address0,account1,address1} = await loadFixture(deployFixtrue);
            const count = ethers.utils.parseEther("200");
            const count1 = ethers.utils.parseEther("150");
            await expect(async ()=>mytoken.transfer(address1,count)).to.changeTokenBalance(mytoken,address1,count);
            await expect(async ()=>{
                return await mytoken.connect(account1).transfer(address0,count1)
            }).to.changeTokenBalance(mytoken,address0,count1);
            expect(await mytoken.balanceOf(address1)).to.equal(ethers.utils.parseEther("50"))

        })
        it("test revert",async function(){
            const {mytoken,address0,account1,address1} = await loadFixture(deployFixtrue);
            const count = ethers.utils.parseEther("2001");
            await expect(mytoken.transfer(address1,count)).to.be.reverted;
            await expect(mytoken.transfer(address1,count)).to.be.revertedWith("ERC20:amount exceeds balance.")
        })

        it("test event Transfer",async function(){
            const {mytoken,address0,account1,address1} = await loadFixture(deployFixtrue);
            
            const count = ethers.utils.parseEther("10");
            await expect(mytoken.transfer(address1,count)).to.emit(mytoken,"Transfer").withArgs(address0,address1,count)
        })

        it("test event Approval",async function(){
            const {mytoken,address0,account1,address1,address2} = await loadFixture(deployFixtrue);
            
            const count = ethers.utils.parseEther("10");
            const count1 = ethers.utils.parseEther("5");
            await expect(mytoken.approve(address1,count)).to.emit(mytoken,"Approval").withArgs(address0,address1,count);
            await expect(mytoken.connect(account1).transferFrom(address0,address2,count1))
            .to.emit(mytoken,"Transfer").withArgs(address0,address2,count1)
        })

        it("test receipt and log",async ()=>{
            const {mytoken,address0,account1,address1,address2} = await loadFixture(deployFixtrue);
            const count = ethers.utils.parseEther("10");
            const txresponse = await mytoken.transfer(address1,count);
            const txreceipt = await txresponse.wait()

            //分析凭条 
            const abiFile:any = require("../artifacts/contracts/MyToken.sol/MyToken.json");
            const iface:any = await new ethers.utils.Interface(abiFile.abi);
            const event:any = iface.parseLog(txreceipt.logs[0]);

            expect(event.name).is.equal("Transfer");
            expect(event.args?.from).is.equal(address0);
            expect(event.args?.to).is.equal(address1);
            expect(event.args?.value).is.equal(count);

        })




    })



})