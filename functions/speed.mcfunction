scoreboard objectives add spd dummy Speed
scoreboard objectives add spdg dummy SpeedGoal
# 각 오브젝티브 추가

execute as @e[type=cybox:dw_tosca] unless score @s spd = @s spd run scoreboard players set @s spd 0
# 스코어가 null이면 0으로 설정

execute as @e[type=cybox:dw_tosca] if score @s spd > @s spdg run scoreboard players remove @s spd 1
execute as @e[type=cybox:dw_tosca] if score @s spd < @s spdg run scoreboard players add @s spd 1
# 목표 속력(spdg)에게 현재 속력(spd)를 수렴