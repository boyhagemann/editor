import React, { useRef, useEffect, HTMLProps, FC } from 'react'
import panzoom from 'panzoom'
import styled from 'styled-components'


interface ContainerProps extends HTMLProps<HTMLDivElement> {
}

const Container: FC<ContainerProps> = styled.div<ContainerProps>`
    user-select: none;
`


const NonScrollable: FC = (props) => {

    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {

        if (!ref.current) return;

        const zoom = panzoom(ref.current, {
            beforeWheel: function (e) {

                // console.log("wheel", e)
                // allow wheel-zoom only if altKey is down. Otherwise - ignore
                // var shouldIgnore = !e.altKey;
                // return shouldIgnore;
                return false
            },
            beforeMouseDown: function (e) {
                // allow mouse-down panning only if altKey is down. Otherwise - ignore
                // var shouldIgnore = !e.altKey;
                return true;
            },
            // @ts-ignore
            filterKey: function (/* e, dx, dy, dz */e: KeyboardEvent) {
                e.preventDefault();

                // don't let panzoom handle this event:
                return true;
            },
            maxZoom: 1,
            minZoom: 1,
            bounds: {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
            },
        })

        return () => {
            zoom.dispose()
        }

    }, [])

    return (<Container ref={ref} {...props} />)
}

export default NonScrollable