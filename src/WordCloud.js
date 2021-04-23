import PropTypes from 'prop-types';
import ReactFauxDom from 'react-faux-dom';
import cloud from 'd3-cloud';
import { Component } from 'react';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { select } from 'd3-selection';

import { defaultFontSizeMapper } from './defaultMappers';

const fill = scaleOrdinal(schemeCategory10);

const getComputedIndex = (id, max) => {
  let sum = 0;
  for (let i = 0; i < id.length; i++) {
    sum += id.charCodeAt(i);
  }

  return sum ? (sum % max) : 0;
}

class WordCloud extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
      })
    ).isRequired,
    font: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    fontSizeMapper: PropTypes.func,
    height: PropTypes.number,
    padding: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    rotate: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    width: PropTypes.number,
    colors: PropTypes.arrayOf(PropTypes.string),
    onWordClick: PropTypes.func,
    onWordMouseOut: PropTypes.func,
    onWordMouseOver: PropTypes.func,
  };

  static defaultProps = {
    width: 700,
    height: 600,
    padding: 5,
    font: 'serif',
    fontSizeMapper: defaultFontSizeMapper,
    rotate: 0,
    colors: [],
    onWordClick: null,
    onWordMouseOver: null,
    onWordMouseOut: null,
  };

  componentWillMount() {
    this.wordCloud = ReactFauxDom.createElement('div');
  }

  render() {
    const {
      data,
      width,
      height,
      padding,
      font,
      fontSizeMapper,
      rotate,
      colors,
      onWordClick,
      onWordMouseOver,
      onWordMouseOut,
    } = this.props;

    // clear old words
    select(this.wordCloud)
      .selectAll('*')
      .remove();

    const fillColor = (colors.length === 0)
      ? (d, i) => fill(i)
      : (d, i) => {
        console.log('Dado WordCloud', d);
        return (i < colors.length ? colors[i] : colors[0])
      };

    // render based on new data
    const layout = cloud()
      .size([width, height])
      .font(font)
      .words(data)
      .padding(padding)
      .rotate(rotate)
      .fontSize(fontSizeMapper)
      .on('end', words => {
        const texts = select(this.wordCloud)
          .append('svg')
          .attr('width', layout.size()[0])
          .attr('height', layout.size()[1])
          .append('g')
          .attr(
            'transform',
            `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})`
          )
          .selectAll('text')
          .data(words)
          .enter()
          .append('text')
          .style('font-size', d => `${d.size}px`)
          .style('font-family', font)
          .style('fill', fillColor)
          .attr('text-anchor', 'middle')
          .attr('transform', d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
          .text(d => d.text);

        if (onWordClick) {
          texts.on('click', onWordClick);
        }
        if (onWordMouseOver) {
          texts.on('mouseover', onWordMouseOver);
        }
        if (onWordMouseOut) {
          texts.on('mouseout', onWordMouseOut);
        }
      });

    layout.start();

    return this.wordCloud.toReact();
  }
}

export default WordCloud;
