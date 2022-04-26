import { SessionData } from "../client/session_data_model.js";

const ParseStartEndEarliestDate = (picked_date, start_time, end_time) => {
    const [date, month, year] = picked_date.split("/")
    const [start_hour, start_minute] = start_time.split(":")
    const [end_hour, end_minute] = end_time.split(":") 

    const start_date = new Date(year, month - 1, date, start_hour, start_minute, 0).toISOString()
    const end_date = new Date(year, month - 1, date, end_hour, end_minute, 59).toISOString()
    const earliest_date = new Date( new Date(start_date) - 1000 * 60 * 30)

    return { start_date, end_date, earliest_date }
}

export const GetDashboardData = async (req, res) => {
    const { picked_date, start_time, end_time } = req.query

    // Date Parsing from Request
    const { start_date, end_date, earliest_date } = ParseStartEndEarliestDate(picked_date, start_time, end_time);

    // Query and Filter the Data Needed
    let aggregate = await SessionData.aggregate().match({ // Filter data from possibly earliest date (30 minutes before the start time)
        start_time: { 
            $gte: new Date(earliest_date),
            $lte: new Date(end_date)
        }
    }).project({ // Filter timestamp based on start time and end time
        start_time: 1,
        createdAt: 1,
        updatedAt: 1,
        sensor_waterlevel_bawah: {
            $filter: {
            input: "$sensor_waterlevel_bawah",
            as: "index",
            cond: {
                $and: [
                    { $gte: [ "$$index.timestamp", new Date(start_date) ] },
                    { $lte: [ "$$index.timestamp", new Date(end_date) ] }
                ]
            }
            }
        },
        sensor_waterlevel_atas: {
            $filter: {
            input: "$sensor_waterlevel_atas",
            as: "index",
            cond: {
                $and: [
                    { $gte: [ "$$index.timestamp", new Date(start_date) ] },
                    { $lte: [ "$$index.timestamp", new Date(end_date) ] }
                ]
            }
            }
        },
        sensor_raindrop: {
            $filter: {
            input: "$sensor_raindrop",
            as: "index",
            cond: {
                $and: [
                    { $gte: [ "$$index.timestamp", new Date(start_date) ] },
                    { $lte: [ "$$index.timestamp", new Date(end_date) ] }
                ]
            }
            }
        }
    })

    // Delete instances which have no data at all
    for (let i = aggregate.length - 1; i >= 0; i--) {
        if (!aggregate[i].sensor_waterlevel_atas.length && !aggregate[i].sensor_waterlevel_bawah.length && !aggregate[i].sensor_raindrop.length) {
          aggregate.splice(i, 1);
        }
    }

    // Organized the array to send data in a structured way
    let data_sensor_waterlevel_bawah = []
    let data_sensor_waterlevel_atas = []
    let data_sensor_raindrop = []

    aggregate.forEach((elmt) => {
        elmt.sensor_waterlevel_bawah.forEach((data) => {
            data_sensor_waterlevel_bawah.push(data)
        })

        elmt.sensor_waterlevel_atas.forEach((data) => {
            data_sensor_waterlevel_atas.push(data)
        })

        elmt.sensor_raindrop.forEach((data) => {
            data_sensor_raindrop.push(data)
        })
    })

    return res.status(200).send({ 
        sensor_waterlevel_atas: data_sensor_waterlevel_atas, 
        sensor_waterlevel_bawah: data_sensor_waterlevel_bawah,
        sensor_raindrop: data_sensor_raindrop 
    })
}