import fm from "front-matter"
import fs from "node:fs"

interface MarkdownComponent {
    id: string
    title: string
    subtitle?: string
    tags: string[]
}

const markdownComponents: MarkdownComponent[] = []

const res = fs.readdirSync(__dirname)
res.forEach((item) => {
    const file = fs.readFileSync(__dirname + item, 'utf-8') ;

    const content = fm(file);
    console.log(file)
    

    markdownComponents.push(
    {
        id: item,
        title: content.attributes['title'],
        tags: [...(content.attributes['tags'] as string).replaceAll(" ", "").split(',')],
        subtitle: content.attributes['subtitle']
    }
    )
})



