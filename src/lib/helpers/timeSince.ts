// takes unix time in seconds and returns a string for how long ago it occured (eg "3 Hrs Ago")
export function getTimeSince(time: number) {
    let timeSince_s: number = Math.floor(Date.now() / 1000) - time
    let timeSince_m: number = Math.floor(timeSince_s/60)
    let timeSince_h: number = Math.floor(timeSince_m/60)
    let timeSince_d: number = Math.floor(timeSince_h/24)
    let timeSince: string = ""

    if (timeSince_h < 1) {
        timeSince = timeSince_m + " Mins Ago"
    } else if (timeSince_h == 1) {
        timeSince = timeSince_h + " Hr Ago"
    } else if (timeSince_d < 1) {
        timeSince = timeSince_h + " Hrs Ago"
    } else if (timeSince_d == 1) {
        timeSince = timeSince_d + " Day Ago"
    } else {
        timeSince = timeSince_d + " Days Ago"
    }

    return timeSince
}