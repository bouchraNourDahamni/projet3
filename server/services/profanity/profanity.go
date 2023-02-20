package profanity

import (
	"strings"

	"github.com/finnbear/moderation"
)

// https://vidalingua.com/blog/french-swear-words
var profanities = []string{
	"putain",
	"merde",
	"bordel",
	"putain de merde",
	"bordel de merde",
	"putain de bordel de merde",
	"nom de dieu",
	"nom de dieu de merde",
	"ostie",
	"tabarnak",
	"crisse",
	"calisse",
	"sacrament",
	"connerie",
	"con",
	"conne",
	"connard",
	"connasse",
	"saloperie",
	"salaud",
	"salopard",
	"salope",
	"pute or putain",
	"garce",
	"traînée",
	"pouffiasse",
	"pouffe",
	"chatte",
	"plotte ",
	"tas de merde",
	"gros tas",
	"trou du cul",
	"lèche-cul",
	"téteux ",
	"fils de pute",
	"couilles",
	"casse-couilles",
	"casser les couilles or péter les couilles",
	"enculer",
	"enculé",
	"enculée",
	"branler",
	"branleur",
	"branleuse",
	"emmerder",
	"emmerdeur",
	"emmerdeuse",
	"chier",
	"chieur",
	"chieuse",
	"chiant",
	"chiante",
	"bite",
	"queutard",
	"metteux",
	"ferme ta gueule",
	"va te faire foutre",
	"va te crosser",
	"niquer",
	"nique ta mère",
	"negre",
}

func IsInappropriate(txt string) bool {
	toSearch := strings.ToLower(txt)
	for _, profanity := range profanities {
		if strings.Contains(toSearch, profanity) {
			return true
		}
	}
	return moderation.IsInappropriate(txt)
}

func Censor(txt string) string {
	toCensor := strings.ToLower(txt)
	for _, profanity := range profanities {
		if strings.Contains(toCensor, profanity) {
			toCensor = strings.ReplaceAll(toCensor, profanity, "*")
		}
	}
	toCensor, _ = moderation.Censor(txt, moderation.Inappropriate)
	return toCensor
}
