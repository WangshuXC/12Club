import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)

// 设置默认时区（东八区）
dayjs.tz.setDefault('Asia/Shanghai')

const replaceTimeUnits = (input: string) => {
  const replacements: Record<string, string> = {
    an: '1',
    a: '1',
    second: '秒',
    seconds: '秒',
    minute: '分钟',
    minutes: '分钟',
    hour: '小时',
    hours: '小时',
    day: '天',
    days: '天',
    week: '周',
    weeks: '周',
    month: '月',
    months: '月',
    year: '年',
    years: '年'
  }

  const regex = new RegExp(Object.keys(replacements).join('|'), 'g')

  return input.replace(regex, (matched) => replacements[matched])
}

export const formatDistanceToNow = (pastTime: number | Date | string) => {
  const localTime = dayjs.utc(pastTime).tz()
  const now = dayjs()

  const time = () => now.to(localTime, true)

  if (time() === 'a few seconds') {
    return '数秒前'
  }

  const localizedTime = replaceTimeUnits(time()).replace(/s\b/g, '')

  return `${localizedTime}前`
}
