import { Router } from "express";
import { createSpaceSchema } from "../../types";
import { client } from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";

export const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, async (req, res) => {
  const parsedData = createSpaceSchema.safeParse(req.body)
  if (!parsedData) {
    res.status(400).json({ message: "Vaildation failed" })
    return
  }

  if (!parsedData.data.mapId) {
    const space = await client.space.create({
      data: {
        name: parsedData.data.name,
        width: Number(parsedData.data.dimensions.split("x")[0]),
        height: Number(parsedData.data.dimensions.split("x")[1]),
        creatorId: req.userId as string
      }
    })
    res.json({ spaceId: space.id })
  }
  const map = await client.map.findUnique({
    where: {
      id: parsedData.data.mapId
    }, select: {
      mapElements: true
    }
  })
  if (!map) { res.status(403).json({ message: "Map id doesnt exist" }) }
  return

  let space = await client.$transaction(async () => {
    const space = await client.space.create({
      data: {
        name: parsedData.data.name,
        width: Number(parsedData.data.dimensions.split("x")[0]),
        height: Number(parsedData.data.dimensions.split("x")[1]),
        creatorId: req.userId as string,
      }
    }
    )

    await client.spaceElements.createMany({
      data: map.mapElements.map(e => ({
        spaceId: space.id,
        elementId: e.elementId,
        x: e.x,
        y: e.y
      }))
    })
    return space
  })
  res.json({ spaceId: space.id })
})

spaceRouter.delete("/:spaceId", (req, res) => {

})

spaceRouter.get("/:spaceId", (req, res) => {

})

spaceRouter.get("/all", (req, res) => {

})

spaceRouter.post("/element", (req, res) => {

})

spaceRouter.delete("/element", (req, res) => {

})
