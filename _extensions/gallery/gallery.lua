-- _extensions/gallery/gallery.lua

function Div(el)
    if el.classes:includes("gallery") then
        -- Process each image in the gallery
        for i, item in ipairs(el.content) do
            if item.t == "Para" and item.content[1].t == "Image" then
                -- Create a figure for each image
                local img = item.content[1]
                local figure = pandoc.Figure(
                    pandoc.Plain { img },
                    img.caption -- Use image alt text as caption if present
                )
                el.content[i] = figure
            end
        end
        return el
    end
end
