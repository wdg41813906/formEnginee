import React from 'react';
import { Switch, Drawer, Button, Collapse } from 'antd';
import styles from '../main.less';
import imgDark from './dark.svg'
import imgLight from './light.svg'
import BlockChecbox from './BlockChecbox';
import BlockColor from './BlockColor';
import { SketchPicker } from 'react-color'


class MainSetting extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      SliderPickerColor: null
    }
    this.toggleSetting = this.toggleSetting.bind(this);
    this.changeSetting = this.changeSetting.bind(this);
    this.clearSetting = this.clearSetting.bind(this);
    this.sliderPickerChange = this.sliderPickerChange.bind(this);
    this.sliderPickerSubmit = this.sliderPickerSubmit.bind(this);
  }
  shouldComponentUpdate(nextProps, nextState) {
    return (
      // JSON.stringify(this.props.main) !== JSON.stringify(nextProps.main) ||
      this.props.appMain.setting !== nextProps.appMain.setting ||
      this.props.appMain.theme !== nextProps.appMain.theme ||
      this.props.appMain.locale !== nextProps.appMain.locale ||
      this.props.appMain.colorWeak !== nextProps.appMain.colorWeak
    )
  }
  toggleSetting() {//展开收起
    this.props.dispatch({
      type: 'appMain/toggleSetting'
    })
  }
  changeSetting(key, val) {//设置
    this.props.dispatch({
      type: 'appMain/changeSetting',
      key,
      val
    })
  }
  clearSetting() {//清除设置
    this.props.dispatch({
      type: 'appMain/clearSetting'
    })
  }
  sliderPickerChange(color, event) {//SliderPicker选择颜色
    this.setState({
      SliderPickerColor: color.hex
    })
  }
  sliderPickerSubmit() {//SliderPicker确认颜色
    this.changeSetting('MainColor', this.state.SliderPickerColor)
  }
  render() {
    let { setting, theme, locale, MainColor, colorWeak } = this.props.appMain;
    const Panel = Collapse.Panel;


    return (
      <Drawer
        title="设置"
        width="300"
        placement="right"
        onClose={this.toggleSetting}
        visible={setting}
      >
        <div className={styles.Setting}>
          <div className={styles.part}>
            <p className={styles.part_title}>整体风格设置</p>
            <BlockChecbox
              list={[
                {
                  key: 'dark',
                  url: imgDark,
                  title: '暗色菜单风格',
                },
                {
                  key: 'light',
                  url: imgLight,
                  title: '亮色菜单风格',
                },
              ]}
              value={theme}
              onChange={value => this.changeSetting('theme', value)}
            />
          </div>
        </div>
        <div className={styles.Setting}>
          <div className={styles.part}>
            <p className={styles.part_title}>主题色设置</p>
            <BlockColor
              list={[
                {
                  key: '#f5222d',
                  title: '薄暮',
                },
                {
                  key: '#fa541c',
                  title: '火山',
                },
                {
                  key: '#faad14',
                  title: '日暮',
                },
                {
                  key: '#13c2c2',
                  title: '明青',
                },
                {
                  key: '#52c412',
                  title: '极光青',
                },
                {
                  key: '#1890ff',
                  title: '拂晓蓝（默认）',
                },
                {
                  key: '#2f54eb',
                  title: '极客蓝',
                },
                {
                  key: '#722ed1',
                  title: '酱紫',
                },
              ]}
              value={MainColor}
              onChange={value => this.changeSetting('MainColor', value)}
            />
            <Collapse style={{ marginTop: 20 }}>
              <Panel header="自定义主题色" key="1" showArrow={false} style={{ padding: 0, textAlign: 'center' }}>
                <SketchPicker onChange={this.sliderPickerChange} color={MainColor} />
                <Button type="primary" size="small" style={{ marginTop: 20 }} onClick={this.sliderPickerSubmit}>确认</Button>
              </Panel>
            </Collapse>
          </div>
        </div>
        <div className={styles.Setting}>
          <div className={styles.part}>
            <p className={styles.part_title}>语言设置</p>
            <Switch
              checked={locale === 'zhCN'}
              onChange={(e) => { this.changeSetting('locale', e ? 'zhCN' : 'en_US') }}
              checkedChildren="中文"
              unCheckedChildren="英文"
            />
          </div>
        </div>
        <div className={styles.Setting}>
          <div className={styles.part}>
            <p className={styles.part_title}>色弱模式</p>
            <Switch
              checked={colorWeak === true}
              onChange={(e) => { this.changeSetting('colorWeak', e ? true : false) }}
              checkedChildren="是"
              unCheckedChildren="否"
            />
          </div>
        </div>
        <Button type="primary" icon="delete" onClick={this.clearSetting}>重置所有设置</Button>
      </Drawer>
    )
  }
}

MainSetting.propTypes = {
};

export default MainSetting;
