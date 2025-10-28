{
	"language":	"mylang",
	"text_length":	20,
	"ast":	{
		"type":	"source",
		"start_byte":	2,
		"end_byte":	20,
		"text":	"def main ()\r\n\r\nend",
		"children":	[{
				"type":	"source_item",
				"start_byte":	2,
				"end_byte":	20,
				"text":	"def main ()\r\n\r\nend",
				"children":	[{
						"type":	"def",
						"start_byte":	2,
						"end_byte":	5,
						"text":	"def"
					}, {
						"type":	"func_signature",
						"start_byte":	6,
						"end_byte":	13,
						"text":	"main ()",
						"children":	[{
								"type":	"identifier",
								"start_byte":	6,
								"end_byte":	10,
								"text":	"main"
							}, {
								"type":	"(",
								"start_byte":	11,
								"end_byte":	12,
								"text":	"("
							}, {
								"type":	")",
								"start_byte":	12,
								"end_byte":	13,
								"text":	")"
							}]
					}, {
						"type":	"end",
						"start_byte":	17,
						"end_byte":	20,
						"text":	"end"
					}]
			}]
	}
}