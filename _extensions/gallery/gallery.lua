-- _extensions/gallery/gallery.lua

function Div(el)
    if el.classes:includes("gallery") then
        local new_div = pandoc.Div({})
        new_div.classes = { "gallery" }

        for _, item in ipairs(el.content) do
            if item.t == "Para" then
                for _, content in ipairs(item.content) do
                    if content.t == "Image" then
                        local figure = pandoc.Div({
                            pandoc.Figure(
                                pandoc.Plain { content },
                                content.caption
                            )
                        })
                        table.insert(new_div.content, figure)
                    end
                end
            end
        end

        return new_div
    end
end
