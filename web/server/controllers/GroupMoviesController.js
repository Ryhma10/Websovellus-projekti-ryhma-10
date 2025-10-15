import {
  addOrUpdateTMDBPost,
  addOrUpdateFinnkinoPost,
  getGroupFeed
} from "../models/GroupMoviesModel.js"

function requireFields(obj, fields) {
  for (const f of fields) {
    if (obj[f] === undefined || obj[f] === null || obj[f] === "") {
      const e = new Error(`Missing field: ${f}`)
      e.status = 400
      throw e
    }
  }
}

export async function postTMDB(req, res, next) {
  try {
    const groupId = Number(req.params.groupId);
    //const userId = req.user?.id; // Authentication asettaa
    const userId = req.user?.id ?? req.user?.userId;
 if (!userId) {
   const e = new Error("Unauthorized: missing user id")
   e.status = 401;
   throw e;
 }
    requireFields(req.body, ["tmdb_id", "snap_title", "snap_overview", "snap_poster_url"])

    const data = await addOrUpdateTMDBPost({
      groupId,
      userId,
      tmdb_id: req.body.tmdb_id,
      note: req.body.note ?? null,
      stars: req.body.stars ?? null,
      snap: {
        title: req.body.snap_title,
        overview: req.body.snap_overview,
        poster_url: req.body.snap_poster_url
      }
    })

    res.json(data)
  } catch (err) { next(err) }
}

export async function postFinnkino(req, res, next) {
  try {
    const groupId = Number(req.params.groupId)
    //const userId = req.user?.id;
    const userId = req.user?.id ?? req.user?.userId;
 if (!userId) {
   const e = new Error("Unauthorized: missing user id")
   e.status = 401
   throw e
 }
    requireFields(req.body, [
      "finnkino_id",
      "snap_title",
      "snap_overview",
      "snap_poster_url",
      "finnkino_showtimes"
    ])

    const showtimesString = typeof req.body.finnkino_showtimes === "string"
      ? req.body.finnkino_showtimes
      : JSON.stringify(req.body.finnkino_showtimes)

    const data = await addOrUpdateFinnkinoPost({
      groupId,
      userId,
      finnkino_id: req.body.finnkino_id,
      note: req.body.note ?? null,
      stars: req.body.stars ?? null,
      snap: {
        title: req.body.snap_title,
        overview: req.body.snap_overview,
        poster_url: req.body.snap_poster_url
      },
      showtimesJsonString: showtimesString
    })

    res.json(data)
  } catch (err) { next(err) }
}

export async function getFeed(req, res, next) {
  try {
    const groupId = Number(req.params.groupId)
    const data = await getGroupFeed(groupId)
    res.json(data)
  } catch (err) { next(err) }
}
