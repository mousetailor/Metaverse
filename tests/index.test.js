const axios = require("axios");

const BACKEND_URL = "http://localhost:3000"

describe("Authentication", () => {
  test('User is able to signup', async () => {
    const username = "anant" + Math.random();
    const password = "123456"
    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin"
    })

    expect(response.statusCode).toBe(200)
    const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin"
    })

    expect(updatedResponse.statusCode).toBe(200)
  });

  test("signup request fail if user request is empty", async () => {
    const username = `anant-${Math.random()}`
    const password = "123456"

    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      password
    })

    expect(response.statusCode).toBe(400)
  })

  test("Signin succeed if the username and password are correct", async () => {
    const username = "anant" + Math.random();
    const password = "123456"

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password
    })

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password
    })
    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined()
  })

  test("Signin fails if the username and password are incorrect", async () => {
    const username = "anant" + Math.random();
    const password = "123456"

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password
    })
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: "wrongusername",
      passsword
    })
    expect(response.statusCode).toBe(403)
  })
})

describe("User metadata endpoints", () => {
  let token = ""
  let avatarId = ""

  beforeAll(async () => {
    const username = "anant" + Math.random();
    const password = "123456"

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin"
    })

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password
    })

    const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
      "imageId": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCEx0uHbfJRFNjHzG_kyW9sSCX8Fh0QJ0KOgcjy7VzAQ&s=10",
      "name": "timmy"
    })
    avatarId = avatarResponse.data.avatarId
    token = response.data.token
  })

  test("User can't update their metadata with wrong avatarId", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
      avatarId: "12345678"
    }, {
      headers: {
        "authorization": `Bearer ${token}`
      }
    })
    except(response.statusCode).toBe(400)
  })

  test("User can update their metadata with correct avatarId", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
      avatarId
    }, {
      headers: {
        "authorization": `Bearer ${token}`
      }
    })
    except(response.statusCode).toBe(200)
  })

  test("User is not able to update their metadata if the auth header is not present", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
      avatarId
    })
    except(response.statusCode).toBe(403)
  })
})

describe("User avatar info", () => {
  let avatarId = ""
  let token = ""
  let userId = ""

  beforeAll(async () => {
    const username = "anant" + Math.random();
    const password = "123456"

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin"
    })

    userId = signupResponse.data.userId

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password
    })

    const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
      "imageId": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCEx0uHbfJRFNjHzG_kyW9sSCX8Fh0QJ0KOgcjy7VzAQ&s=10",
      "name": "timmy"
    })
    avatarId = avatarResponse.data.avatarId
    token = response.data.token
  })

  test("Get back avatar information for the user", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`)
    expect(response.data.avatars.length).toBe(1)
    expect(response.data.avatars[0].userId).toBe(userId)
  })

  test("Available avatars lists the recently created avatar", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`)
    expect(response.data.avatars.length).not.toBe(0)
    const currentAvatar = response.data.avatars.find(x => x.id == avatarId)
    expect(currentAvatar).toBeDefined()
  })
})

describe("Space information", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let userToken;
  let userId;
  let adminToken;
  let adminId;
  beforeAll(async () => {

    const username = "anant" + Math.random();
    const password = "123456"

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin"
    })

    adminId = signupResponse.data.userId

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password
    })

    adminToken = response.data.token

    const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username: username + "-user",
      password,
      type: "user"
    })

    userId = userSignupResponse.data.userId

    const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password
    })

    userToken = userResponse.data.token

    const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      width: 1,
      height: 1,
      static: true
    }, {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    })

    const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      width: 1,
      height: 1,
      static: true
    }, {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    })

    element1Id = element1.id
    element2Id = element2.id

    const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "Test space",
      "defaultElements": [{
        elementId: element1Id,
        x: 20,
        y: 20
      }, {
        elementId: element1Id,
        x: 18,
        y: 20
      }, {
        elementId: element2Id,
        x: 19,
        y: 20
      }
      ]
    }, {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    })
    mapId = map.id
  })

  test("User is able to create a space", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
      name: "Test",
      dimensions: "100x200",
      mapId: mapId
    }, {
      header: {
        authorization: `Bearer ${userToken}`
      }
    })
    expect(response.spaceId).toBeDefined()
  })

  test("User is able to create a space without a spaceId", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
      name: "Test",
      dimensions: "100x200"
    }, {
      header: {
        authorization: `Bearer ${userToken}`
      }
    })
    expect(response.spaceId).toBeDefined()
  })

  test("User is not able to create a space without spaceId and mapdimensions", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
      name: "Test",
    }, {
      header: {
        authorization: `Bearer ${userToken}`
      }
    })
    expect(response.statusCode).toBe(400)
  })

  test("User is not able to delete a space that does not exist", async () => {
    const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdThatDoesntExist`,
      {
        header: {
          authorization: `Bearer ${userToken}`
        }
      })
    expect(response.statusCode).toBe(400)
  })

  test("User is able to delete a space that does exist", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
      name: "Test",
      dimensions: "100x200"
    }, {
      header: {
        authorization: `Bearer ${userToken}`
      }
    })
    const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`, {
      header: {
        authorization: `Bearer ${userToken}`
      }
    })
    expect(deleteResponse.statusCode).toBe(200)
  })

  test("User should not be able to delete a space created by another user", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
      name: "Test",
      dimensions: "100x200"
    }, {
      header: {
        authorization: `Bearer ${userToken}`
      }
    })
    const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`, {
      header: {
        authorization: `Bearer ${adminToken}`
      }
    })
    expect(deleteResponse.statusCode).toBe(400)
  })

  test("Admin has no spaces initially", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/space/all`, {
      header: {
        authorization: `Bearer ${userToken}`
      }
    })
    expect(response.data.spaces.length).toBe(0)
  })

  test("Admin has no spaces initially", async () => {
    const spaceCreateResponse = await axios.post(`${BACKEND_URL}/api/v1/space/all`, {
      name: "Test",
      dimensions: "100x200"
    }, {
      header: {
        authorization: `Bearer ${userToken}`
      }

    })
    const response = await axios.post(`${BACKEND_URL}/api/v1/space/all`, {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    })
    const filteredSpace = response.data.spaces.find(x => x.id == spaceCreateResponse.spaceId)
    expect(response.data.spaces.length).toBe(1);
    expect(filteredSpace).toBeDefined();
  })
})

describe("Arena endpoints", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let userToken;
  let userId;
  let adminToken;
  let adminId;
  beforeAll(async () => {

    const username = "anant" + Math.random();
    const password = "123456"

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin"
    })

    adminId = signupResponse.data.userId

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password
    })

    adminToken = response.data.token

    const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username: username + "-user",
      password,
      type: "user"
    })

    userId = userSignupResponse.data.userId

    const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: username + "-user",
      password
    })

    userToken = userResponse.data.token

    const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      width: 1,
      height: 1,
      static: true
    }, {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    })

    const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
      imageUrl: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      width: 1,
      height: 1,
      static: true
    }, {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    })

    element1Id = element1.id
    element2Id = element2.id

    const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
      "thumbnail": "https://thumbnail.com/a.png",
      "dimensions": "100x200",
      "name": "Test space",
      "defaultElements": [{
        elementId: element1Id,
        x: 20,
        y: 20
      }, {
        elementId: element1Id,
        x: 18,
        y: 20
      }, {
        elementId: element2Id,
        x: 19,
        y: 20
      }
      ]
    }, {
      headers: {
        authorization: `Bearer ${adminToken}`
      }
    })
    mapId = map.id

    const space = await axios.post(`${BACKEND_URL}/api/v1`, {
      name: "Test",
      dimensions: "100x200",
      mapId: mapId
    }, {
      header: {
        authorization: `Bearer ${userToken}`
      }
    })
    spaceId = space.id
  })

  test("Incorrect spaceId returns a 400", async () => {
    const response = await axios.get(`${BACKEND_URL}/ap/v1/space/123kwf`, {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    })
    expect(response.statusCode).toBe(400)
  })
  test("Correct spaceId returns a 200", async () => {
    const response = await axios.get(`${BACKEND_URL}/ap/v1/space/${spaceId}`, {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    }
    )
    expect(response.data.dimensions).toBe("100x200")
    expect(response.data.elements.length).toBe(3)
  })
  test("Delete endpoint is able to delete an element", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`)
    await axios.delete(`${BACKEND_URL}/ap/v1/space/element`, {
      spaceId,
      elementId: response.data.elements[0].id
    }, {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    })

    const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    })
    expect(newResponse.data.elements.length).toBe(2)
  })
  test("Adding an element works as expected", async () => {
    await axios.delete(`${BACKEND_URL}/ap/v1/space/element`, {
      elementId: element1Id,
      spaceId: spaceId,
      x: 50,
      y: 20
    }, {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    })

    const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    })
    expect(newResponse.data.elements.length).toBe(3)
  })
  test("Adding an element fails if the element lies outside the dimensions", async () => {
    const newResponse = await axios.delete(`${BACKEND_URL}/ap/v1/space/element`, {
      elementId: element1Id,
      spaceId: spaceId,
      x: 10000,
      y: 200000
    }, {
      headers: {
        authorization: `Bearer ${userToken}`
      }
    })

    expect(newResponse.statusCode).toBe(404)
  })
})
