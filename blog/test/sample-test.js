const { expect } = require("chai")

describe("Blog", async function() {
    it("should create a post", async function() {
        const Blog = await ethers.getContractFactory("Blog")
        const blog = await Blog.deploy("My blog")
        await blog.deployed()
        await blog.createPost("My first post", "12345")
        
        const posts = await blog.fetchPosts()
        expect(posts[0].title).to.equal("My first post")
    })

    it("should edit a post", async function() {
        const Blog = await ethers.getContractFactory("Blog")
        const blog = await Blog.deploy("My blog")
        await blog.deployed()
        await blog.createPost("My first post", "12345")
        await blog.updatePost(1, "My updated post", "23456", true)
        posts = await blog.fetchPosts()
        expect(posts[0].title).to.equal("My updated post")
    })

    it("should add update the name", async function () {
        const Blog = await ethers.getContractFactory("Blog")
        const blog = await Blog.deploy("My blog")
        await blog.deployed()

        expect(await blog.name()).to.equal("My blog")
        await blog.updateName('My new blog')
        expect(await blog.name()).to.equal("My new blog")
    })
})