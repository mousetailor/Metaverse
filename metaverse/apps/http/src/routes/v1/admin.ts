import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin";
import { createAvatarSchema, createElementSchema, createMapSchema, updateElementSchema } from "../../types";
import { client } from "@repo/db/client";

export const adminRouter = Router();

adminRouter.post("/element", adminMiddleware, async (req, res) => {
  const parsedData = createElementSchema.safeParse(req.body)
  if (!parsedData) {
    res.status(400).json({
      message: "Validation failed"
    })
    return
  }

  const element = await client.element.create({
    data: {
      width: parseInt(parsedData.data.width),
      height: parseInt(parsedData.data.height),
      static: parsedData.data.static,
      imageUrl: parsedData.data.imageUrl
    }
  })
  res.json({
    id: element.id
  })
})

adminRouter.put("/element/:elementId", adminMiddleware, async (req, res) => {
  const parsedData = updateElementSchema.safeParse(req.body)
  if (!parsedData) {
    res.status(400).json({
      message: "Validation failed"
    })
    return
  }
  const update = await client.element.update({
    where: {
      id: req.params.elementId as string,
    }, data: {
      imageUrl: parsedData.data.imageUrl
    }
  })
  res.json({
    message: "Element updated"
  })
})

adminRouter.post("/avatar", adminMiddleware, async (req, res) => {
  const parsedData = createAvatarSchema.safeParse(req.body)
  if (!parsedData) {
    res.status(400).json({
      message: "Validation failed"
    })
    return
  }

  const avatar = await client.avatar.create({
    data: {
      name: parsedData.data.name,
      imageUrl: parsedData.data.imageUrl
    }
  })
  res.json({
    id: avatar.id
  })
})

adminRouter.post("/map", adminMiddleware, async (req, res) => {
  const parsedData = createMapSchema.safeParse(req.body)
  if (!parsedData.success) {
    res.status(400).json({
      message: "Validation failed"
    })
    return
  }
  const mapCreation = await client.map.create({
    data: {
      name: parsedData.data.name,
      width: parsedData.data.width,
      height: parsedData.data.height,
      thumbnail: parsedData.data.thumbnail,
      mapElements: {
        create: parsedData.data.defaultElements.map(e => ({
          elementId: e.elementId,
          x: e.x,
          y: e.y
        })
        )
      }
    }
  })
  res.json({
    id: mapCreation.id
  })
}













