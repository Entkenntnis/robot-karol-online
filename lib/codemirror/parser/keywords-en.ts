import {
  CmdEnd,
  CmdStart,
  CommandWithParameter,
  ConditionMaybeWithParam,
  ConditionWithoutParam,
  ElseKey,
  IfEndKey,
  IfKey,
  KarolPrefix,
  RepeatAlwaysKey,
  RepeatEnd,
  RepeatStart,
  RepeatTimesKey,
  RepeatWhileKey,
  ThenKey,
} from './parser.terms'

export function keywords(input: string) {
  if (/^(repeat)$/i.test(input)) return RepeatStart
  if (/^((end_|\*)repeat)$/i.test(input)) return RepeatEnd
  if (/^(while)$/i.test(input)) return RepeatWhileKey
  if (/^(times)$/i.test(input)) return RepeatTimesKey
  if (/^(always)$/i.test(input)) return RepeatAlwaysKey
  if (/^(if)$/i.test(input)) return IfKey
  if (/^(then)$/i.test(input)) return ThenKey
  if (/^((end_|\*)if)$/i.test(input)) return IfEndKey
  if (/^(else)$/i.test(input)) return ElseKey
  if (/^(command)$/i.test(input)) return CmdStart
  if (/^((end_|\*)(command))$/i.test(input)) return CmdEnd
  if (/^(karol)$/i.test(input)) return KarolPrefix
  if (
    /^(is_wall|not_is_wall|is_mark|not_is_mark|is_north|not_is_north|is_south|not_is_south|is_east|not_is_east|is_west|not_is_west)$/i.test(
      input
    )
  )
    return ConditionWithoutParam
  if (/^(is_brick|not_is_brick)$/i.test(input)) return ConditionMaybeWithParam
  if (/^(step|set_down|pick_up)$/i.test(input)) return CommandWithParameter
  if (/^(mark_field|unmark_field|turn_left|turn_right|exit)$/i.test(input))
    return CommandWithParameter

  return -1
}
