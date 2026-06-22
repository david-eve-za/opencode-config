export function register(api: any) {
  api.addTool({
    name: "tf-plan",
    description: "Run Terraform plan — preview infrastructure changes",
    args: {
      dir: api.schema.string().optional().describe("Terraform directory (default: .)"),
      var_file: api.schema.string().optional().describe("Variable file"),
      out: api.schema.string().optional().describe("Plan output file"),
    },
    async execute({ dir = ".", var_file, out }) {
      return `tf-plan: planning ${dir}${var_file ? ` -var-file=${var_file}` : ""}${out ? ` -out=${out}` : ""}`
    }
  })
}
